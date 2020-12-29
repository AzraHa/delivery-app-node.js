const mongoose = require('mongoose');
const moment = require('moment');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  admin:{

  },
  date: {
    type: Date,
    default: Date.now
  },
  status:{
    type: Boolean,
    required:true
  },
  modified:{
    type:String,
    default: moment(new Date).format("MM/DD/YYYY, h:mm:ss a")
  }
});

const RestaurantAdmin = mongoose.model('RestaurantAdmin', RestaurantSchema);

module.exports = RestaurantAdmin;
