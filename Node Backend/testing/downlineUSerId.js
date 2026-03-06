const {
  getAllUsersIdsByDownline,
} = require("../controllers/admin/downlineList/utile");
const { handler } = require("../controllers/admin/downlineList/getList");
async function test() {
  console.time("startTime");
  //65f470fbc9fa68e4b2f2b71c
  const ddd = await handler({
    body: { status: "active" },
    user: { userId: "65f470fbc9fa68e4b2f2b71c" },
  });
  // const ddd = await getAllUsersIdsByDownline("6329a13e830f5c7c40401092", []);
  console.timeEnd("startTime");

  console.log(ddd);
}

test();
