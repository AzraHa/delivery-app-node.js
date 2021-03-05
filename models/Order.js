const mongoose = require('mongoose');
const moment = require('moment');

const orderSchema = new mongoose.Schema({
  customer:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  supplier: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
  food:[{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
  status:{type:Number,required:true},
  date: {type: Date, default: moment().format("MM/DD/YYYY, hh:mm:ss")}
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
