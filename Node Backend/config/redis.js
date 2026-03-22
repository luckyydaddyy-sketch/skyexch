const redis = require("redis");
const config = require("./config");
const mongo = require("./mongodb");
const Bull = require("bull");
const {
  getpages,
  getPremium,
  getOddsPages,
  getBookPages,
  getFancyPages,
  getSport,
  getFastSport,
} = require("./sportsAPI");
const inPlay = require("../controllers/helper/inPlay");
const sportCountVellki = require("../controllers/helper/sportCountVellki");
const fancyWinner = require("../controllers/admin/setting/manageFancy/declareWinner");
class redisHandle {
  constructor() {
    const {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      REDIS_DB,
      REDIS_IS_ON,
      env,
    } = config;
    console.log("connect ::: ", {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      REDIS_DB,
    });

    const redisConfig = {
      socket: { host: REDIS_HOST, port: REDIS_PORT },
    };

    if (REDIS_PASSWORD !== "") redisConfig.password = REDIS_PASSWORD;
    if (REDIS_DB) {
      redisConfig.database = REDIS_DB;
    }

    if (REDIS_IS_ON) {
      this.client = redis.createClient(redisConfig);

      this.client.connect();
      this.client.on("ready", () => {
        console.log("Redis connected successfully.");
        if (env !== "test") {
          // this.bullScheduler();
          // this.bullSchedulerForInPlay();
          // this.bullSchedulerForFancyResult();
          // this.bullSchedulerForLiveMatchStoreData();

          setTimeout(() => {
            sportQueueProcess();
          }, 500); // this.bullScheduler();
          setTimeout(() => {
            getSportsListingPageData();
          }, 500); // this.bullScheduler();
          setTimeout(() => {
            sportInPlayQueueProcess();
          }, 1000); // this.bullSchedulerForInPlay();
          setTimeout(() => fancyWinnerQueueProcess(), 5000); // this.bullSchedulerForFancyResult();
          setTimeout(() => sportLiveMatchStoreQueueProcess(), 600000); // this.bullSchedulerForLiveMatchStoreData();
        }
        // this.testBull();
      });

      this.client.on("error", (error) => {
        console.error("CATCH_ERROR : Redis Client error:", error);
      });
    }
  }
  async testBull() {
    console.log("test bull");

    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = config;

    const redisConfig = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };

    if (REDIS_PASSWORD !== "") redisConfig.password = REDIS_PASSWORD;
    if (REDIS_DB) {
      redisConfig.db = REDIS_DB;
    }

    const sportQueue = new Bull("testBull", {
      redis: redisConfig,
      settings: {
        stalledInterval: 5000,
      },
    });

    // sportQueue.clean(1000 * 60 * 60, 'failed').then((jobs) => {
    setInterval(() => {
      sportQueue.clean(0, "failed").then((jobs) => {
        const removePromises = jobs.map(async (job) => {
          const jobTemp = await sportQueue.getJob(job);
          if (jobTemp) {
            return jobTemp.remove();
          }
        });
        Promise.all(removePromises);
      });
    }, 300000); // every 3 min

    const data = {
      date: new Date(),
    };
    const options = {
      // delay: data.timer, // in ms
      // jobId: data.tableId,
      removeOnComplete: true,
      repeat: {
        every: 500,
        // limit: 100,
      },
      lockDuration: 3600000,
    };

    await sportQueue.add(data, options);

    sportQueue.process(testProcess);
  }
  async bullScheduler() {
    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = config;

    const redisConfig = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };

    if (REDIS_PASSWORD !== "") redisConfig.password = REDIS_PASSWORD;
    if (REDIS_DB) {
      redisConfig.db = REDIS_DB;
    }

    const sportQueue = new Bull("sportQueue", {
      redis: redisConfig,
      settings: {
        stalledInterval: 5000,
      },
    });

    setInterval(() => {
      sportQueue.clean(0, "failed").then((jobs) => {
        const removePromises = jobs.map(async (job) => {
          const jobTemp = await sportQueue.getJob(job);
          if (jobTemp) {
            return jobTemp.remove();
          }
        });
        Promise.all(removePromises);
      });
    }, 3000); // every 3 min

    const data = {
      date: new Date(),
    };
    const options = {
      // delay: data.timer, // in ms
      // jobId: data.tableId,
      removeOnComplete: true,
      repeat: {
        every: 500,
        // limit: 100,
      },
      lockDuration: 3600000,
    };

    await sportQueue.add(data, options);

    sportQueue.process(sportQueueProcess);
  }

  async bullSchedulerForInPlay() {
    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = config;

    const redisConfig = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };

    if (REDIS_PASSWORD !== "") redisConfig.password = REDIS_PASSWORD;
    if (REDIS_DB) {
      redisConfig.db = REDIS_DB;
    }

    const sportQueue = new Bull("sportInPlayTabQueue", {
      redis: redisConfig,
      settings: {
        stalledInterval: 5000,
      },
    });

    setInterval(() => {
      sportQueue.clean(0, "failed").then((jobs) => {
        const removePromises = jobs.map(async (job) => {
          const jobTemp = await sportQueue.getJob(job);
          if (jobTemp) {
            return jobTemp.remove();
          }
        });
        Promise.all(removePromises);
      });
    }, 30000); // every 3 min
    const data = {
      date: new Date(),
    };
    const options = {
      // delay: data.timer, // in ms
      // jobId: data.tableId,
      removeOnComplete: true,
      repeat: {
        every: 1000,
        // limit: 100,
      },
      lockDuration: 3600000,
    };

    await sportQueue.add(data, options);

    sportQueue.process(sportInPlayQueueProcess);
  }

  async bullSchedulerForFancyResult() {
    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = config;

    const redisConfig = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };

    if (REDIS_PASSWORD !== "") redisConfig.password = REDIS_PASSWORD;
    if (REDIS_DB) {
      redisConfig.db = REDIS_DB;
    }

    const sportQueue = new Bull("fancyWinnerQueue", {
      redis: redisConfig,
      settings: {
        stalledInterval: 5000,
      },
    });

    setInterval(() => {
      sportQueue.clean(0, "failed").then((jobs) => {
        const removePromises = jobs.map(async (job) => {
          const jobTemp = await sportQueue.getJob(job);
          if (jobTemp) {
            return jobTemp.remove();
          }
        });
        Promise.all(removePromises);
      });
    }, 30000); // every 3 min

    const data = {
      date: new Date(),
    };
    const options = {
      // delay: data.timer, // in ms
      // jobId: data.tableId,
      removeOnComplete: true,
      repeat: {
        every: 5000,
        // limit: 100,
      },
      lockDuration: 3600000,
    };

    await sportQueue.add(data, options);

    sportQueue.process(fancyWinnerQueueProcess);
  }

  async bullSchedulerForLiveMatchStoreData() {
    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = config;

    const redisConfig = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };

    if (REDIS_PASSWORD !== "") redisConfig.password = REDIS_PASSWORD;
    if (REDIS_DB) {
      redisConfig.db = REDIS_DB;
    }

    const sportQueue = new Bull("sportLiveMatchStoreData", {
      redis: redisConfig,
      settings: {
        stalledInterval: 5000,
      },
    });

    // sportQueue.clean(1000 * 60 * 60, 'failed').then((jobs) => {
    //   console.log('Cleaned failed jobs:', jobs);
    // });
    setInterval(() => {
      sportQueue.clean(0, "failed").then((jobs) => {
        const removePromises = jobs.map(async (job) => {
          const jobTemp = await sportQueue.getJob(job);
          if (jobTemp) {
            return jobTemp.remove();
          }
        });
        Promise.all(removePromises);
      });
    }, 3600000); // every 1 hours

    const data = {
      date: new Date(),
    };
    const options = {
      // delay: data.timer, // in ms
      // jobId: data.tableId,
      removeOnComplete: true,
      repeat: {
        every: 600000, // every 10 min
        // limit: 100,
      },
      lockDuration: 3600000,
    };

    await sportQueue.add(data, options);

    sportQueue.process(sportLiveMatchStoreQueueProcess);
  }
  setValueInKeyWithExpiry(key, obj, exp = 5) {
    const { REDIS_IS_ON } = config;
    if (!REDIS_IS_ON) {
      return true;
    }

    return this.client.setEx(key, exp, JSON.stringify(obj));
  }
  setValueInKeyWithExpiryForSportList(key, obj, exp = 5) {
    const { REDIS_IS_ON } = config;
    if (!REDIS_IS_ON) {
      return true;
    }
    const storeData = {
      data: obj,
    };
    // console.log("setValueInKeyWithExpiryForSportList : obj :: ", obj);
    console.log(
      "setValueInKeyWithExpiryForSportList : typeof obj :: ",
      typeof obj
    );

    return this.client.setEx(key, exp, JSON.stringify(storeData));
  }
  setValueInKey(key, obj) {
    const { REDIS_IS_ON } = config;
    console.log("setValueInKey : ", key);
    if (!REDIS_IS_ON) {
      return true;
    }
    console.log("setValueInKey : after: ", key);
    return this.client.set(key, JSON.stringify(obj));
  }
  deleteKey(key) {
    const { REDIS_IS_ON } = config;
    if (!REDIS_IS_ON) {
      return true;
    }
    return this.client.del(key);
  }

  lPush(key, value) {
    const { REDIS_IS_ON } = config;
    if (!REDIS_IS_ON) {
      return true;
    }

    return this.client.lPush(key, value);
  }

  async checkKeyIsVailable(key, value) {
    const listItems = await this.client.lRange(key, 0, -1); // Get all elements in the list
    console.log("checkKeyIsVailable: listItems ::: keys : ", listItems);

    const exists = listItems.includes(value);
    console.log("checkKeyIsVailable: listItems ::: exists : ", value, exists);
    return exists;
  }

  lPop(key, value) {
    return this.client.lRem(key, 1, value);
  }

  async getValueFromKey(key) {
    const { REDIS_IS_ON } = config;
    if (!REDIS_IS_ON) {
      return null;
    }
    const valueStr = await this.client.get(key);

    if (valueStr) return JSON.parse(valueStr);
    else return valueStr;
  }

  async getListOfKeys(pattern) {
    return await this.client.keys(pattern);
  }
}
const redisData = new redisHandle();

const testProcess = () => {
  console.log("testProcess run", new Date());
  if (Math.random() > 0.5) {
    console.log("job failed");
    throw new Error("Job failed");
  }
  return "Job completed successfully";
};
const sportQueueProcess = async () => {
  try {
    // console.log("sportQueueProcess :::", new Date());

    const { API_CALL_KEY, DETAIL_PRE_KEY, DETAIL_PAGE_KEY } = config;

    // console.time('s')
    const getListOfKey = await redisData.getListOfKeys(`${API_CALL_KEY}:*`);
    // console.timeEnd('s')

    // console.log(new Date(), "sportQueueProcess :: getListOfKey ::: ", getListOfKey);
    // console.log("getListOfKey.length :: ", getListOfKey.length);
    if (getListOfKey.length) {
      for await (const sportKey of getListOfKey) {
        const splitData = sportKey.split(":");
        const eventId = splitData[1];
        const marketId = splitData[2];
        const type = splitData[3];
        await getSportDetailPageData(eventId, marketId, type);
        // const page = await getpages(eventId, marketId);
        // await redisData.setValueInKeyWithExpiry(
        //   `${DETAIL_PAGE_KEY}:${eventId}:${marketId}`,
        //   page,
        //   600
        // );

        // const pre = await getPremium(eventId, marketId);
        // await redisData.setValueInKeyWithExpiry(
        //   `${DETAIL_PRE_KEY}:${eventId}:${marketId}`,
        //   pre,
        //   600
        // );
      }
    }
    setTimeout(() => {
      sportQueueProcess();
    }, 300);
    return true;
  } catch (error) {
    console.error("sportQueueProcess:: error: ", error);
  }
};

const fancyWinnerQueueProcess = async () => {
  try {
    const { DETAIL_PAGE_KEY, FANCY_WINNER, FANCY_WINNER_SELECTION } = config;
    console.log("fancyWinnerQueueProcess : call : ");
    const getListOfKey = await redisData.getListOfKeys(`${FANCY_WINNER}:*`);
    console.log("fancyWinnerQueueProcess : call : getListOfKey : ", getListOfKey);

    console.log("sportQueueProcess :: getListOfKey ::: ", getListOfKey);
    console.log("getListOfKey.length :: ", getListOfKey.length);
    if (getListOfKey.length) {
      for await (const sportKey of getListOfKey) {
        const splitData = sportKey.split(":");
        const eventId = splitData[1];
        const marketId = splitData[2];

        const sportDetail = await mongo.bettingApp
          .model(mongo.models.sports)
          .findOne({
            query: {
              gameId: eventId,
              marketId: marketId,
            },
            select: {
              _id: 1,
              type: 1,
            },
          });

        const page = await getFancyPages(eventId, marketId);
        // await redisData.setValueInKeyWithExpiry(
        //   `${DETAIL_PAGE_KEY}:${eventId}:${marketId}`,
        //   page
        // );

        console.log("fancyWinnerQueueProcess: sportDetail: ", sportDetail);
        //   {
        //     "b1": 0,
        //     "bs1": 0,
        //     "gType": "Fancy Bet",
        //     "gameid": 33297578,
        //     "l1": 0,
        //     "ls1": 0,
        //     "marketId": "1.229297058",
        //     "nat": "1st Wkt Pship Boundaries ENGW Adv",
        //     "result": -1,
        //     "sId": 1536663,
        //     "sortPriority": 1536663,
        //     "status": "ACTIVE"
        // }
        console.log("fancyWinnerQueueProcess : call : page : ", page);
        if (Array.isArray(page?.data?.t3)) {
          for (const fancyDetail of page.data.t3) {
            if (fancyDetail?.result !== -1) {
            console.log(
              "fancyWinnerQueueProcess : call : page : fancyDetail: ",
              fancyDetail
            );
            // const isVailable = await redisData.checkKeyIsVailable(
            //   FANCY_WINNER_SELECTION,
            //   fancyDetail?.nat
            // );

            // console.log('fancyWinnerQueueProcess : FANCY_WINNER_SELECTION : ', FANCY_WINNER_SELECTION, fancyDetail?.nat);
            // console.log('fancyWinnerQueueProcess : isVailable : ', isVailable);

            // if (isVailable) {
            // await redisData.lPop(
            //   FANCY_WINNER_SELECTION,
            //   fancyDetail?.nat
            // );
            try {
              await fancyWinner.handler({
                body: {
                  id: sportDetail?._id,
                  winner: fancyDetail?.result,
                  selection: fancyDetail?.nat,
                },
              });
            } catch (error) {
              console.error("fancyWinnerQueueProcess : working Error: ", error);
            }

            // }
          }
        }
      }
        console.log("fancyWinnerQueueProcess : call : after : done");
        console.log(
          "fancyWinnerQueueProcess: sportDetail: done :",
          sportDetail
        );

        const betCount = await mongo.bettingApp
          .model(mongo.models.betsHistory)
          .distinct({
            query: {
              betType: "session",
              betStatus: { $ne: "completed" },
              matchId: sportDetail?._id,
            },
            field: "selection",
          });
        console.log(
          "fancyWinnerQueueProcess : call : after : done : betCount",
          betCount
        );

        if (betCount.length === 0) {
          await redisData.deleteKey(`${FANCY_WINNER}:${eventId}:${marketId}`);
        }
      }
    }
    setTimeout(() => fancyWinnerQueueProcess(), 5000);
    return true;
  } catch (error) {
    console.error("fancyWinnerQueueProcess: error", error);
  }
};

const sportInPlayQueueProcess = async () => {
  try {
    const { ONLINE_PLAYER, IN_PLAY_KET, VELLKI_SPORTS_COUNT } = config;

    const getListOfKey = await redisData.getValueFromKey(`${ONLINE_PLAYER}`);

    // console.log("sportInPlayQueueProcess ::: ", getListOfKey);
    if (getListOfKey) {
      // const data = await Promise.all([
      const play = await inPlay({
        body: {
          filter: "play",
        },
      });
      await redisData.setValueInKeyWithExpiry(`${IN_PLAY_KET}:play`, play);
      const today = await inPlay({
        body: {
          filter: "today",
        },
      });
      await redisData.setValueInKeyWithExpiry(`${IN_PLAY_KET}:today`, today);
      const tomorrow = await inPlay({
        body: {
          filter: "tomorrow",
        },
      });
      await redisData.setValueInKeyWithExpiry(
        `${IN_PLAY_KET}:tomorrow`,
        tomorrow
      );
      // ]);

      // for await(const tempData of data) {
      //   await redisData.setValueInKeyWithExpiry(
      //     `${IN_PLAY_KET}:${tempData.filter}`,
      //     tempData
      //   );
      // }

      const sportCount = await sportCountVellki();
      await redisData.setValueInKeyWithExpiry(
        `VELLKI_SPORTS_COUNT`,
        sportCount
      );
    }
    setTimeout(() => {
      sportInPlayQueueProcess();
    }, 1000);
    return true;
  } catch (error) {
    console.error("sportInPlayQueueProcess: error:", error);
  }
};

const sportLiveMatchStoreQueueProcess = async () => {
  try {
    const { IN_PLAY_KET } = config;

    const play = await inPlay({
      body: {
        filter: "play",
      },
    });

    await redisData.setValueInKeyWithExpiry(`${IN_PLAY_KET}:play`, play);

    for await (const cricket of play.cricket) {
      await getSportDetailPageData(cricket.gameId, cricket.marketId, "cricket");
    }
    for await (const soccer of play.soccer) {
      await getSportDetailPageData(soccer.gameId, soccer.marketId, "soccer");
    }
    for await (const tennis of play.tennis) {
      await getSportDetailPageData(tennis.gameId, tennis.marketId, "tennis");
    }
    setTimeout(() => sportLiveMatchStoreQueueProcess(), 600000);
    return true;
  } catch (error) {
    console.error("sportLiveMatchStoreQueueProcess: error: ", error);
  }
};

const getSportDetailPageData = async (eventId, marketId, type) => {
  try {
    const {
      DETAIL_PAGE_KEY,
      DETAIL_PRE_KEY,
      DETAIL_BOOK_KEY,
      DETAIL_FANCY_KEY,
    } = config;

    // let page = await redisData.getValueFromKey(
    //   `${DETAIL_PAGE_KEY}:${eventId}:${marketId}`
    // );
    // if (!page) {
    //   page = {
    //     data: {
    //       t1: [],
    //       t2: [],
    //       t3: [],
    //     },
    //   };
    // }
    const pageOdds = await getOddsPages(eventId, marketId);
    // if (pageOdds) {
    //   page.data["t1"] = pageOdds?.data?.t1;
    // }
    await redisData.setValueInKeyWithExpiry(
      `${DETAIL_PAGE_KEY}:${eventId}:${marketId}:${type}`,
      pageOdds,
      180
    );

    const pageBook = await getBookPages(eventId, marketId);
    // if (pageOdds) {
    //   page.data["t2"] = pageBook?.data?.t2;
    // }
    await redisData.setValueInKeyWithExpiry(
      `${DETAIL_BOOK_KEY}:${eventId}:${marketId}:${type}`,
      pageBook,
      180
    );

    if (type === "cricket") {
      const pageFancy = await getFancyPages(eventId, marketId);
      // if (pageOdds) {
      //   page.data["t3"] = pageFancy?.data?.t3;
      // }
      await redisData.setValueInKeyWithExpiry(
        `${DETAIL_FANCY_KEY}:${eventId}:${marketId}:${type}`,
        pageFancy,
        180
      );
    }

    const pre = await getPremium(eventId, marketId);
    await redisData.setValueInKeyWithExpiry(
      `${DETAIL_PRE_KEY}:${eventId}:${marketId}:${type}`,
      pre,
      180
    );

    return true;
  } catch (error) {
    console.error("getSportDetailPageData:: error:", error);
  }
};

const getSportsListingPageData = async () => {
  try {
    const {
      ONLINE_PLAYER,
      SPORTS_LIST_CRICKET,
      SPORTS_LIST_SOCCER,
      SPORTS_LIST_TENNIS,
    } = config;

    const getListOfKey = await redisData.getValueFromKey(`${ONLINE_PLAYER}`);
    if (getListOfKey) {
      try {
        const cricketRes = await getFastSport(4);
        await redisData.setValueInKeyWithExpiryForSportList(
          SPORTS_LIST_CRICKET,
          cricketRes.data
        );
        const soccerRes = await getFastSport(1);
        await redisData.setValueInKeyWithExpiryForSportList(
          SPORTS_LIST_SOCCER,
          soccerRes.data
        );
        const tennisRes = await getFastSport(2);
        await redisData.setValueInKeyWithExpiryForSportList(
          SPORTS_LIST_TENNIS,
          tennisRes.data
        );
        await getSportDetailPageOnlyInPlayMatch(cricketRes);
      } catch (error) {
        console.error("getSportsListingPageData : error: ", error);
      }
    }

    setTimeout(() => {
      getSportsListingPageData();
    }, 500);

    return true;
  } catch (error) {
    console.error("getSportsListingPageData : error:", error);
  }
};

const getSportDetailPageOnlyInPlayMatch = async (data) => {
  const inPlayMatch = data.data.filter((_v) => _v.p);

  for await (const match of inPlayMatch) {
    await getSportDetailPageData(match.gameId, match.marketId, "cricket");
  }
};
module.exports = redisData;
