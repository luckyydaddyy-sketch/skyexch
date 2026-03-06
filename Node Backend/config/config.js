const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");
const ApiError = require("../utils/ApiError");

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test", "sandbox")
      .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    MASTER_DB: Joi.string().required().description("Mongo Master DB Name"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({
    errors: {
      label: "key",
    },
  })
  .validate(process.env);
if (error) {
  throw new ApiError(`Config validation error: ${error.message}`);
}
console.log(envVars.MONGODB_URL, envVars.MASTER_DB);
console.log("envVars.CASINO_LIMITS : ", envVars.CASINO_LIMITS)
module.exports = {
  env: envVars.NODE_ENV,
  ENVIRONMENT: envVars.ENVIRONMENT,
  port: envVars.PORT,
  SERVER_PREFIX: envVars.SERVER_PREFIX,

  PROD_BASE_URL: envVars.PROD_BASE_URL,
  VALID_OTP: envVars.VALID_OTP,
  mongoose: {
    url: envVars.MONGODB_URL,
    master_db: envVars.MASTER_DB,
    options: {
      // useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
    withReminderUserLoginExpirationHours:
      envVars.JWT_WITH_RE_USER_EXPIRATION_HOURS,
    withoutReminderUserLoginExpirationHours:
      envVars.JWT_WITHOUT_RE_USER_EXPIRATION_HOURS,
  },
  // email: {
  //   accessKey: envVars.SES_ACCESS_KEY,
  //   secretKey: envVars.SES_SECRET_KEY,
  // },
  // s3: {
  //   bucketName: envVars.S3_BUCKET_NAME,
  //   region: envVars.S3_REGION,
  //   accessKey: envVars.S3_ACCESS_KEY,
  //   secretKey: envVars.S3_SECRET_KEY,
  //   basedUrl: envVars.S3_BASE_URL,
  //   endpoint: envVars.S3_ENDPOINT,
  // },
  // AWS: {
  //   region: envVars.AWS_REGION,
  //   apiVersion: envVars.AWS_APIVERSION,
  //   accessKeyId: envVars.SES_ACCESS_KEY,
  //   secretAccessKey: envVars.SES_SECRET_KEY,
  // },

  // SWAGGER_HOST: envVars.SWAGGER_HOST,

  // ENV_CONFIG: envVars.ENV_CONFIG,
  SPORTS_API_BASE_URL: envVars.SPORTS_API_BASE_URL,
  SPORTS_API_PORT: envVars.SPORTS_API_PORT || 3005,
  SPORTS_T3_API_PORT: envVars.SPORTS_T3_API_PORT || 5006,
  SPORTS_T4_API_PORT: envVars.SPORTS_T4_API_PORT || 5006,
  OWNER_COMMISSION: envVars.OWNER_COMMISSION === "true",
  // client header
  in_play: envVars.in_play === "true",
  multi_market: envVars.multi_market === "true",
  cricket: envVars.cricket === "true",
  soccer: envVars.soccer === "true",
  tennis: envVars.tennis === "true",
  casino: envVars.casino === "true",
  eSoccer: envVars?.eSoccer === "true" || false,
  basketBall: envVars?.basketBall === "true" || false,
  isOnlyPlayerDepositWithdrawa: envVars?.isOnlyPlayerDepositWithdrawa === "true" || false,
  // sport bet
  odds_suspend: envVars.odds_suspend === "true",
  bookmaker_suspend: envVars.bookmaker_suspend === "true",
  signup: envVars.signup === "true",
  IS_COM_ADMIN_GET_COMMISSION: envVars.IS_COM_ADMIN_GET_COMMISSION === "true",
  IS_CASE_SENSITIVE_LOGIN: envVars.IS_CASE_SENSITIVE_LOGIN === "true",
  KEY_FILE: envVars.KEY_FILE,
  CRT_FILE: envVars.CRT_FILE,
  CASINO_BASE_URL: envVars.CASINO_BASE_URL,
  CASINO_CERT: envVars.CASINO_CERT,
  CASINO_USERID: envVars.CASINO_USERID,
  CASINO_CURRENCY: envVars.CASINO_CURRENCY,
  COMMON_PASSWORD: envVars.COMMON_PASSWORD,
  PRIFIX: envVars.PRIFIX,

  EVOLATION: {
    CURRENCY: envVars.EVOLATION_CURRENCY,
    CASINO_BASE_URL: envVars.EVOLATION_BASE_URL,
    KEY: envVars.EVOLATION_KEY,
    TOKEN: envVars.EVOLATION_TOKEN,
  },

  REDIS_HOST: envVars.REDIS_HOST,
  REDIS_PORT: envVars.REDIS_PORT,
  REDIS_PASSWORD: envVars.REDIS_PASSWORD,
  REDIS_DB: envVars.REDIS_DB,
  REDIS_IS_ON:
    typeof envVars.REDIS_IS_ON !== "undefined"
      ? envVars.REDIS_IS_ON === "true"
      : true,

  DETAIL_PAGE_KEY: "detailPageKey",
  DETAIL_BOOK_KEY: "detailBookKey",
  DETAIL_FANCY_KEY: "detailFancyKey",
  DETAIL_PRE_KEY: "detailPreKey",
  API_CALL_KEY: "apiCallKey",
  IN_PLAY_KET:'inPlayCallKey',
  ONLINE_PLAYER : 'imOnline',
  VELLKI_SPORTS_COUNT : 'vellki_sports_count',
  FANCY_WINNER : 'fancy_winner',
  FANCY_WINNER_SELECTION : 'fancy_selection',
  SPORTS_LIST_CRICKET : 'sport_list_cricket',
  SPORTS_LIST_SOCCER : 'sport_list_soccer',
  SPORTS_LIST_TENNIS : 'sport_list_tennis',
  CASINO_LIMITS : envVars.CASINO_LIMITS,
  LUCK_SPORT_TOKEN : "LUCK_SPORT_TOKEN"
};
