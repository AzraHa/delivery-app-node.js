const mongoose = require('mongoose');
const moment = require('moment');
const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: { type: mongoose.Schema.Types.ObjectId, ref: "FoodType" },
  price: {
    type: String,
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

const Food = mongoose.model('Food', FoodSchema);

module.exports = Food;
