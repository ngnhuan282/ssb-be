const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
    },
    class: {
        type: String,
        trim: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, 
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true
    }, 
    pickupPoint: {
        type: String,
        required: true,
    }, 
    dropoffPoint: {
        type: String,
        required: true,
    }, 
    status: {
        type: String,
        enum: ['pending', 'picked_up', 'dropped_off'],
        default: 'pending'
    },
})

const Student = mongoose.model('Student', studentSchema);

module.exports = { Student };