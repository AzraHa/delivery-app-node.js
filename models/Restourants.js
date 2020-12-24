const mongoose = require('mongoose');

const RestourantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  address:{
    type: String,
    required: true
  },
  status:{
    type: Boolean,
    default: 1
  }
});

const Restourant = mongoose.model('Restourant', RestourantSchema);

module.exports = Restourant;
