const mongoose = require('mongoose');
const moment = require('moment');
const SaleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
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

const Sale = mongoose.model('Food', SaleSchema);

module.exports = Sale;
