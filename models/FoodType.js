const mongoose = require('mongoose');
const moment = require('moment');

const FoodTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
    default: moment().format("MM/DD/YYYY, h:mm:ss ")
  }
});

const FoodType = mongoose.model('FoodType', FoodTypeSchema);

module.exports = FoodType;
