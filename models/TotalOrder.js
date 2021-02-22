const mongoose = require('mongoose');
const moment = require('moment');

const TotalOrderSchema = new mongoose.Schema({
  orders:[{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  customer:{type:mongoose.Schema.Types.ObjectId,ref: "User"},
  restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
  supplier: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }],
  status:{type:Number,required:true},
  date: {type: Date,  default: moment(new Date).format("MM/DD/YYYY, h:mm:ss a")}
});

const TotalOrder = mongoose.model('TotalOrder', TotalOrderSchema);

module.exports = TotalOrder;
