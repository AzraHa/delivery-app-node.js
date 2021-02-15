const mongoose = require('mongoose');
const moment = require('moment');

const RestaurantTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    modified:{
        type:String,
        default: moment(new Date).format("MM/DD/YYYY, h:mm:ss a")
    }
});

const RestaurantType = mongoose.model('RestaurantType', RestaurantTypeSchema);

module.exports = RestaurantType;
