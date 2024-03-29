const mongoose = require('mongoose');
const moment = require('moment');
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
    koordinate:{type:String},
    picture:{
      type:String,
      default:""
    },
    date: {
        type: Date,
        default: moment().format("MM/DD/YYYY, h:mm:ss ")
    },
    status:{
        type: Boolean,
        default: 1
    },
    role:{
        type:String,
        default:"superAdmin"
    }
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
