var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyCVWoPIcc1pz1z5p_Ja6_CD7Ed9MzWN_ko',
  formatter: null
};
var geocoder = NodeGeocoder(options);

module.exports = geocoder;
