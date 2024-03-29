const mongoose = require('mongoose');
const moment = require('moment');

const RestaurantSchema = new mongoose.Schema({
  name: {type: String, required: true},
  tip:{ type: mongoose.Schema.Types.ObjectId, ref: "RestaurantType" },
  address:{type: String, required: true},
  koordinate:{type:String},
  email: {type: String, required: true},
  admin:[{ type: mongoose.Schema.Types.ObjectId, ref: "RestaurantAdmin" }],
  suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
  image:{type: String},
  distance:{type:Number},
  date: {type: Date, default: Date.now},
  status:{type: Boolean, required:true},
  modified:{type:String, default: moment().format("MM/DD/YYYY, h:mm:ss ")},
  rated:{type:Number},
  star:{type:Number}
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = Restaurant;
