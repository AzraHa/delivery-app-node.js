var mongoose = require("mongoose");

var MapSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  location: String,
  lat: Number,
  lng: Number,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }
});
const Map = mongoose.model('Map', MapSchema);

module.exports = Map;
