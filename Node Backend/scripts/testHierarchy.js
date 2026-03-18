const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongo = require("../config/mongodb");
const { USER_LEVEL_NEW, ONLINE_PAYMENT } = require("../constants");
const { generateReferralCode } = require("../utils/global");

const testHierarchyData = [
  { level: 1, role: USER_LEVEL_NEW.SUO, username: "testsuo1", password: "SkyAdmin123", amount: 500000, transfer: 400000 },
  { level: 2, role: USER_LEVEL_NEW.WL, username: "testwl2", password: "SkyAdmin123", amount: 400000, transfer: 300000 },
  { level: 3, role: USER_LEVEL_NEW.SP, username: "testsa3", password: "SkyAdmin123", amount: 300000, transfer: 200000 },
  { level: 4, role: USER_LEVEL_NEW.AD, username: "testad4", password: "SkyAdmin123", amount: 200000, transfer: 150000 },
  { level: 5, role: USER_LEVEL_NEW.SUA, username: "testsua5", password: "SkyAdmin123", amount: 150000, transfer: 100000 },
  { level: 6, role: USER_LEVEL_NEW.SS, username: "testss6", password: "SkyAdmin123", amount: 100000, transfer: 75000 },
  { level: 7, role: USER_LEVEL_NEW.S, username: "tests7", password: "SkyAdmin123", amount: 75000, transfer: 50000 },
  { level: 8, role: USER_LEVEL_NEW.M, username: "testm8", password: "SkyAdmin123", amount: 50000, transfer: 15000 },
  { level: 9, role: "PL", username: "testpl9", password: "SkyAdmin123", amount: 15000, transfer: 0 },
];

async function createHierarchy() {
  console.log("Starting hierarchy creation...");

  // Wait for mongo to connect (using the existing instance)
  await new Promise((resolve) => {
    if (mongo.bettingApp.dbName) resolve();
    else {
      // Small delay to ensure mongo config is loaded
      setTimeout(resolve, 2000);
    }
  });

  try {
    // 1. Find Root Owner
    let parent = await mongo.bettingApp.model(mongo.models.admins).findOne({
      query: { user_name: "admin" }
    });

    if (!parent) {
      console.error("Root admin 'admin' not found!");
      process.exit(1);
    }

    console.log(`Root Admin Found: ${parent.user_name} | Balance: ${parent.remaining_balance}`);

    for (const data of testHierarchyData) {
      const { level, role, username, password, amount, transfer } = data;
      console.log(`\n--- Creating Level ${level}: ${username} (${role}) ---`);

      // 2. Check if user already exists
      let existingUser;
      if (role === "PL") {
        existingUser = await mongo.bettingApp.model(mongo.models.users).findOne({ query: { user_name: username } });
      } else {
        existingUser = await mongo.bettingApp.model(mongo.models.admins).findOne({ query: { user_name: username } });
      }

      if (existingUser) {
        console.log(`User ${username} already exists. Skipping creation.`);
        parent = existingUser;
        continue;
      }

      // 3. Prepare Document
      const whoAdd = [...parent.whoAdd, parent._id.toString()].map(id => mongo.ObjectId(id));
      const document = {
        user_name: username,
        password: password.trim(),
        firstName: "Test",
        lastName: `Level${level}`,
        commission: parent.commission || 0,
        rolling_delay: parent.rolling_delay || false,
        domain: parent.domain,
        delay: parent.delay || {},
        newPassword: false,
        whoAdd: whoAdd,
        admin: parent._id,
        status: "active",
        balance: amount,
        remaining_balance: amount,
        agent_level: role === "PL" ? undefined : role
      };

      if (role === USER_LEVEL_NEW.M) {
        document.refferCode = generateReferralCode(8);
      } else if (role === "PL") {
        document.refferCode = generateReferralCode(8);
        document.agent_level = undefined; // Users don't have agent_level usually or it's different
      }

      // 4. Insert Child
      let child;
      if (role === "PL") {
        child = await mongo.bettingApp.model(mongo.models.users).insertOne({ document });
        // Create stacks for player
        await mongo.bettingApp.model(mongo.models.stacks).insertOne({
          document: { userId: child._id, stack: [10, 50, 100, 200, 500, 1000] }
        });
        // Update parent's player list
        await mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: parent._id },
          update: { $push: { player: child._id } }
        });
      } else {
        child = await mongo.bettingApp.model(mongo.models.admins).insertOne({ document });
        // Update parent's agent list
        await mongo.bettingApp.model(mongo.models.admins).updateOne({
          query: { _id: parent._id },
          update: { $push: { agent: child._id } }
        });
      }

      // 5. Deduced balance from Parent
      await mongo.bettingApp.model(mongo.models.admins).updateOne({
        query: { _id: parent._id },
        update: { $inc: { remaining_balance: -amount } }
      });

      // 6. Record Statements
      const remark = `Initial fund from ${parent.user_name}`;
      
      // Debit Parent Statement
      await mongo.bettingApp.model(mongo.models.statements).insertOne({
        document: {
          userId: parent._id,
          credit: 0,
          debit: amount,
          balance: parent.remaining_balance - amount,
          Remark: remark,
          type: role === "PL" ? "player" : "agent",
          from: parent._id,
          to: child._id,
          fromModel: "admins",
          toModel: role === "PL" ? "users" : "admins"
        }
      });

      // Credit Child Statement
      await mongo.bettingApp.model(mongo.models.statements).insertOne({
        document: {
          userId: child._id,
          credit: amount,
          debit: 0,
          balance: amount,
          Remark: remark,
          type: role === "PL" ? "player" : "agent",
          from: parent._id,
          to: child._id,
          fromModel: "admins",
          toModel: role === "PL" ? "users" : "admins"
        }
      });

      // Record Withdrawal (Audit entry like in update.js)
      await mongo.bettingApp.model(mongo.models.withdrawals).insertOne({
        document: {
          [role === "PL" ? "userId" : "adminId"]: child._id,
          userName: child.user_name,
          amount: amount,
          image: "",
          accountNo: "",
          transactionType: ONLINE_PAYMENT.OFFLINE_DEPOSIT,
          approvalBy: parent._id,
          isApprove: true
        }
      });

      console.log(`Created successful: ${username}`);
      parent = child;
    }

    console.log("\n--- HIERARCHY CREATION COMPLETED ---");
    process.exit(0);

  } catch (error) {
    console.error("Error creating hierarchy:", error);
    process.exit(1);
  }
}

createHierarchy();
