const { fancyScheduler } = require("../utils/scheduler/fancyScheduler");

async function test(num) {
  const key = "124";
  const isOnGoing = await fancyScheduler.checkScheduler(key);
  console.log(new Date(), `test : isOnGoing: ${num} :`, isOnGoing);

  if (!isOnGoing) {
    console.log(new Date(), `test : add: ${num} :`, key);
    fancyScheduler.addToScheduler(key);

    setTimeout(() => {
      console.log(new Date(), `test : remove: ${num}: `, key);
      fancyScheduler.removeFromScheduler(key);
    }, 3000);
  }else{
    console.log(new Date(), `test : fail: ${num} :`, key);
  }
}
let num = 0;
setInterval(() => {
  if (num < 5) {
    test(num);
    num++;
  }
}, 1000);
