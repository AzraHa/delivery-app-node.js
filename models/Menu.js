const mongoose = require('mongoose');
const moment = require('moment');
const MenuSchema = new mongoose.Schema({
    name:{type:String,required:true},
    food:  [ {type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
    price: {type: String},
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    status:{type: Boolean, required:true},
    modified:{type:String, default: moment().format("MM/DD/YYYY, h:mm:ss ")},
    type:{ type: mongoose.Schema.Types.ObjectId, ref: "FoodType" },
    picture:{type:String},
    description:{type:String}
});
const Menu = mongoose.model('Menu', MenuSchema);
module.exports = Menu;
