// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h2>" + feature.properties.place +
      "</h2><hr><h4>" + "Magnitude: " + feature.properties.mag + "</h4><p>" + new Date(feature.properties.time) + "</p>");
  }

  function radius(rad){
      return rad * 20000;
  }

  function markerColor(col){

    if(col > 5){
        return "red"
    }
    else if(col > 4){
        return "darkorange"
    }
    else if(col > 3){
        return "orange"
    }
    else if(col > 2){
        return "yellow"
    }
    else if(col > 1){
        return "limegreen"
    }
    else{
        return "lightgreen"
    }
  }


  function pointToLayer(feature, latlng){
      return L.circle(latlng, {
        radius: radius(feature.properties.mag),
        fillColor: markerColor(feature.properties.mag),
        opacity: .25,
        fillOpacity: 0.8
      })
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(null, overlayMaps).addTo(myMap);

    // Create a legend to display information about our map
    var legend = L.control({
        position: "bottomright"
    });
    
    legend.onAdd = function (myMap) {

        var div = L.DomUtil.create('div', 'info legend');
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = ["lightgreen", "limegreen", "gold", "red", "darkred", "scarlet"];
            labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    // Add the info legend to the map
    legend.addTo(myMap);
}