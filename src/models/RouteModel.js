const mongoose = require("mongoose");

const routeModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    stops: [{
        location: {type: String, required: true},
        time: { type: Date }
    }],
    distance: {
        type: Number,
        min: 0,
    },
    estimatedTime: {
        type: Number,
        min: 0
    },
    assignedBus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus"
    }
})

const Route = mongoose.model("Route", routeModel);
module.exports = { Route };

