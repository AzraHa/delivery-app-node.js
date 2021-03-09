const mongoose = require('mongoose');
const moment = require('moment');
const SaleSchema = new mongoose.Schema({
    food:  { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    date_from:{
        type:String,
        required:true
    },
    date_to: {
        type: String,
        required: true
    },
    salePrice: {
        type: String
    },
    picture :{
        type: String,
        required: true
    },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    date: {
        type: Date,
        default: moment().format("MM/DD/YYYY, h:mm:ss ")
    },
    status:{
        type: Boolean,
        required:true
    },
    modified:{
        type:String,
        default: moment().format("MM/DD/YYYY, h:mm:ss ")
    }
});

const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;
