var map = L.map('map');
var entries = [];

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function showPopup(latlng) {
  var hits = [];
  entries.forEach(function (entry) {
    entry._layers.forEach(function (layer) {
      if (layerContainsPoint(layer, latlng)) {
        hits.push(entry);
      }
    });
  });

  if (hits.length === 0) return;

  var html = hits.map(function (entry) {
    return '<div class="popup-card">' +
      '<a href="' + entry.url + '" target="_blank">' +
        '<img class="popup-thumb" src="' + entry.thumbnail + '" alt="' + entry.name + '">' +
        '<div class="popup-title">' + entry.name + '</div>' +
        '<div class="popup-view">View in collection &#8599;</div>' +
      '</a>' +
    '</div>';
  }).join('');

  L.popup()
    .setLatLng(latlng)
    .setContent(html)
    .openOn(map);
}

map.on('click', function (e) {
  showPopup(e.latlng);
});

function layerContainsPoint(layer, latlng) {
  if (typeof layer.getBounds === 'function') {
    return layer.getBounds().contains(latlng);
  }
  return false;
}

fetch('config.json')
  .then(function (response) { return response.json(); })
  .then(function (data) {
    var allLayers = L.featureGroup();

    data.forEach(function (entry) {
      var geoLayer = L.geoJSON(entry.geojson, {
        style: { color: '#800000' }
      });
      geoLayer.addTo(allLayers);

      var featureLayers = [];
      geoLayer.eachLayer(function (l) { featureLayers.push(l); });

      var center = geoLayer.getBounds().getCenter();
      var marker = L.circleMarker(center, {
        radius: 6,
        color: '#800000',
        fillColor: '#800000',
        fillOpacity: 0.8
      });
      var bounds = geoLayer.getBounds();
      marker.on('click', function (e) {
        L.DomEvent.stopPropagation(e);
        map.fitBounds(bounds, { padding: [50, 50] });
        showPopup(center);
      });
      marker.addTo(allLayers);

      entries.push({
        name: entry.name,
        url: entry.url,
        thumbnail: entry.thumbnail,
        _layers: featureLayers,
        _marker: marker
      });
    });

    allLayers.addTo(map);
    var initialBounds = allLayers.getBounds();
    map.fitBounds(initialBounds);

    var ResetControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        var btn = L.DomUtil.create('button', 'leaflet-bar');
        btn.innerHTML = '&#8634;';
        btn.title = 'Reset view';
        btn.style.cssText = 'background:#fff;border:none;width:34px;height:34px;font-size:20px;cursor:pointer;line-height:34px;';
        L.DomEvent.disableClickPropagation(btn);
        btn.addEventListener('click', function () {
          map.closePopup();
          map.fitBounds(initialBounds);
        });
        return btn;
      }
    });
    new ResetControl().addTo(map);
  });
