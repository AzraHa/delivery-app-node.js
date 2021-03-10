const mongoose = require('mongoose');
const moment = require('moment');
const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: { type: mongoose.Schema.Types.ObjectId, ref: "FoodType" },
  description:{
    type:String,
    required:true
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: {
    type: String
  },
  picture :{
    type: String,
    required: true
  },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  meni:{
    type:Boolean,
    required:true
  },
  date: {
    type: Date,
    default: moment().format("MM/DD/YYYY, h:mm:ss ")
  },
  status:{
    type: Boolean,
    required:true
  },
  modified:{
    type:String,
    default: moment().format("MM/DD/YYYY, h:mm:ss ")
  },
  ordered:{
    type:Number
  }
});

const Food = mongoose.model('Food', FoodSchema);

module.exports = Food;
