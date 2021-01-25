const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
  customer:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  food:[{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
  status:{type:Boolean,required:true},
  date: {type: Date, default: Date.now}
});

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
