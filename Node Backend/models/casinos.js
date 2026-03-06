const mongoose = require('mongoose');

const casinosSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    picture:{
        type: String,
        required: true,
    },
    videoLink:{
        type: String,
        required: true,
    },
    type:{
        type: String,
        enum: ["casino","live casino"],
        default : "casino"
    },
    status:{
        type: Boolean,
        default: true
    },
    minBet:{
        type: Number,
        default: true
    },
    maxBet:{
        type: Number,
        default: true
    }
}, {
    timestamps: true,
});

module.exports = casinosSchema;