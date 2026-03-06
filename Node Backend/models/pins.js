const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        index: true,
        required: true,
    },
    type:{
        type: String,
        index: true,
        required: true,
    },
    pin: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "sports",
          default: null,
        },
      ],
}, {
    timestamps: true,
});

module.exports = tokenSchema;