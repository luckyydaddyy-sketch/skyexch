const joi = require("joi");
const DB = require("../../../../config/mongodb");
const redis = require("../../../../config/redis");

const httpStatus = require("http-status");
const ApiError = require("../../../../utils/ApiError");

const handler = async ({ body }) => {
  const { activeSportsProvider, activeCasinoProvider } = body;

  const updateFields = {};
  if (activeSportsProvider) {
    if (!["FASTODDS", "NINE_WICKET"].includes(activeSportsProvider)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid activeSportsProvider");
    }
    updateFields.activeSportsProvider = activeSportsProvider;
  }
  
  if (activeCasinoProvider) {
      if (!["AWC", "EVOLUTION"].includes(activeCasinoProvider)) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid activeCasinoProvider");
      }
      updateFields.activeCasinoProvider = activeCasinoProvider;
  }

  if (Object.keys(updateFields).length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No fields to update");
  }

  const apiModel = DB.bettingApp.model(DB.models.apiProviders);
  const existing = await apiModel.findOne({ query: {} });

  if (!existing) {
    await apiModel.insertOne({
      document: {
        activeSportsProvider: updateFields.activeSportsProvider || "FASTODDS",
        activeCasinoProvider: updateFields.activeCasinoProvider || "AWC",
      }
    });
  } else {
    await apiModel.updateMany({
        query: {},
        update: {
            $set: updateFields
        }
    });
  }

  // Also update Redis to reflect instantly across the backend gateway
  if (updateFields.activeSportsProvider) {
      await redis.setValueInKey('ACTIVE_SPORTS_PROVIDER', updateFields.activeSportsProvider);
  }
  if (updateFields.activeCasinoProvider) {
      await redis.setValueInKey('ACTIVE_CASINO_PROVIDER', updateFields.activeCasinoProvider);
  }

  return {
    ...updateFields,
    msg: "API Provider settings updated successfully"
  };
};

module.exports = {
  handler,
  auth: true
};
