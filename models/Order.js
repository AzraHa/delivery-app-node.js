const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
  customer:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  quantity:{type:Number,required:true},
  restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  supplier: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
  food:[{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
  status:{type:Number,required:true},
  date: {type: Date, default: Date.now}
});

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
