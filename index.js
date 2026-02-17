var map = L.map('map');

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

fetch('config.json')
  .then(function (response) { return response.json(); })
  .then(function (entries) {
    var allLayers = L.featureGroup();

    entries.forEach(function (entry) {
      var layer = L.geoJSON(entry.geojson, {
        style: { color: '#800000' },
        onEachFeature: function (feature, layer) {
          layer.on('click', function () {
            window.open(entry.url, '_blank');
          });
        }
      });
      layer.addTo(allLayers);
    });

    allLayers.addTo(map);
    map.fitBounds(allLayers.getBounds());
  });
