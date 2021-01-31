const mongoose = require('mongoose');

const TotalOrderSchema = new mongoose.Schema({
  orders:[{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  customer:{type:mongoose.Schema.Types.ObjectId,ref: "User"},
  restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  supplier: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
  status:{type:Number,required:true},
  date: {type: Date, default: Date.now}
});

const TotalOrder = mongoose.model('TotalOrder', TotalOrderSchema);

module.exports = TotalOrder;
