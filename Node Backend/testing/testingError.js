const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const CUSTOM_MESSAGE = require("../utils/message");

function test2() {
    try {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            CUSTOM_MESSAGE.YOUR_TENNIS_BLOCKED
          );       
    } catch (error) {
        console.error("test2 : ");
        throw error;
    }finally{
        console.log("test2: final2");
    }
}

async function test1() {
    try {
       await test2()     
    } catch (error) {
        console.error("test1 : ");
        throw error;
    }finally{
        console.log("test1: final1");
    }
}

async function test() {
    try {
        const dd = await test1();
        console.log("dd : ", dd);
        
    } catch (error) {
        console.error("test : ", error);
    }finally{
        console.log("test: final");
    }
}

test()