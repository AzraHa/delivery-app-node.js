const mongoose = require('mongoose');
const moment = require('moment');

const RestaurantAdminSchema = new mongoose.Schema({
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
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  address:{
    type: String,
  },
  koordinate:{
    type:String,
    required:true
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

const RestaurantAdmin = mongoose.model('RestaurantAdmin', RestaurantAdminSchema);

module.exports = RestaurantAdmin;
