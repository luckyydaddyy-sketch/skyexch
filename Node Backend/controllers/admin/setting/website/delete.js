const joi = require("joi");
const mongo = require("../../../../config/mongodb");

const payload = {
    body: joi.object().keys({
        id: joi.string().required(),
    }),
};

async function handler({ body }) {
    const { id } = body;

    const getSite = await mongo.bettingApp
    .model(mongo.models.websites)
    .findOne({
        query: {
            _id: mongo.ObjectId(id),
        }
    });

    if(getSite){
        await mongo.bettingApp
        .model(mongo.models.websites)
        .updateOne({
            query: {
                _id: mongo.ObjectId(id),
            },
            update: {
                isDeleted: true,
                status: false
            }
        });
        
        getSite.msg = "Website deleted successfully!";
        return getSite;
    } else {
        const error = new Error("Website not found");
        error.statusCode = 404;
        throw error;
    }
}

module.exports = {
    payload,
    handler,
    auth: true,
};
