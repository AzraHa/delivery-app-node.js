const mongoose = require('mongoose');
const moment = require('moment');

const FoodTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
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

const FoodType = mongoose.model('FoodType', FoodTypeSchema);

module.exports = FoodType;
