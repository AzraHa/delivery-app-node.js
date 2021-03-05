const mongoose = require('mongoose');
const moment = require('moment');
const UserSchema = new mongoose.Schema({
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
  koordinate:{type:String,required:true},
  number:{type:Number,required:true},
  picture:{type:String},
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "TotalOrder" }],
    restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
    date: {
        type: Date,
        default: Date.now
    },
    status:{
        type: Number,
        required:true
    },
    modified:{
        type:String,
        default: moment(new Date).format("MM/DD/YYYY, h:mm:ss a")
    },
    role:{
        type:String,
        default:"customer"
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
