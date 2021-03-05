const mongoose = require('mongoose');
const moment = require('moment');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  picture:{type:String},
  s_address:{
    type: String,
    required: true
  },
  koordinate:{
    type:String,
    required:true
  },
  orders:[{ type: mongoose.Schema.Types.ObjectId, ref: "TotalOrder" }],
  password:{
    type: String
  },

  restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
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
    default: moment(new Date).format("MM/DD/YYYY, h:mm:ss ")
  },
  role:{
    type:String,
    default:"supplier"
  }
});

const Supplier = mongoose.model('Supplier', SupplierSchema);

module.exports = Supplier;
