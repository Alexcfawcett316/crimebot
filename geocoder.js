var GoogleMapsAPI = require('googlemaps');
var bodyParser = require('body-parser');

var publicConfig = {
  key: '',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true // use https
};

var gmAPI = new GoogleMapsAPI(publicConfig);

module.exports = {
  geocodeString: function (addressString, callback) {

    var geocodeParams = {
      "address":    addressString,
      "components": "components=country:GB",
      "bounds":     "55,-1|54,1",
      "language":   "en",
      "region":     "uk"
    };  

    gmAPI.geocode(geocodeParams , function(err, result){
      callback(result.results);
    });
  },
};


