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
    koordinate:{
      type:String
    },
  email: {
    type: String,
    required: true
  },
  admin:[{ type: mongoose.Schema.Types.ObjectId, ref: "RestaurantAdmin" }],
  suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
  image:{
    type: String
  },
  distance:{type:Number},
  food: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food"}],
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
  },
  type:[{ type: mongoose.Schema.Types.ObjectId, ref: "RestaurantType"}],
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = Restaurant;
