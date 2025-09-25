const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    licensePlate: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    model: {
        type: String,
        trim: true,
    },
    capacity: {
        type: Number,
        min: 1,
        required: true
    }
})

const Bus = mongoose.model("Bus", busSchema);
module.exports = { Bus };