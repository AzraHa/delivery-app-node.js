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
    default: moment().format("MM/DD/YYYY, h:mm:ss ")
  },
  status:{
    type: Number,
    required:true,
    default: 1
  },
  modified:{
    type:String,
    default: moment().format("MM/DD/YYYY, h:mm:ss ")
  },
  role:{
    type:String,
    default:"supplier"
  }
});

const Supplier = mongoose.model('Supplier', SupplierSchema);

module.exports = Supplier;
