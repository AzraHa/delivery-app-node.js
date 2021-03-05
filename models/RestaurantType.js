const mongoose = require('mongoose');
const moment = require('moment');

const RestaurantTypeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    status:{type: Boolean, required:true},
    modified:{type:String, default: moment().format("MM/DD/YYYY, h:mm:ss a")}
});

const RestaurantType = mongoose.model('RestaurantType', RestaurantTypeSchema);

module.exports = RestaurantType;
