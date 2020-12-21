const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status:{
        type: Boolean,
        default: 1
    }
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
