const joi = require("joi");

const mongo = require("../../../../config/mongodb");


const payload = {
    body: joi.object().keys({
        id: joi.string().required(),
    }),
};

async function handler({ body }) {
    const {
        id,
    } = body;

    const getSite = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({
        query: {
            _id: mongo.ObjectId(id),
        },select:{
            isMaintenance: 1
        }

    });

    if(getSite){
        await mongo.bettingApp
        .model(mongo.models.websites)
        .updateOne({
            query: {
                _id: mongo.ObjectId(id),
            },update: {
                isMaintenance:typeof getSite.isMaintenance === undefined ? true : !getSite.isMaintenance
            }
        });
    }

    getSite.msg = "maintenance webSite update Successfully!";

    return getSite;
}

module.exports = {
    payload,
    handler,
    auth: true,
};
