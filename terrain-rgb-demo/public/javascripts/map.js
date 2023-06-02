//Add your MapBox API Token here
mapboxgl.accessToken = '<your MapBox API Token here>';

$('#download').click(function() {
  var splitName = this.name.split("-");
  var tileInfo = {
    z: splitName[0],
    x: splitName[1],
    y: splitName[2],
    token: mapboxgl.accessToken
  }
  var url = getUrl('/elevation/', tileInfo);
  window.location.href = url;
});

$('#download-slope').click(function() {
  var splitName = this.name.split("-");
  var tileInfo = {
    cellsize: splitName[0],
    z: splitName[1],
    x: splitName[2],
    y: splitName[3],
    token: mapboxgl.accessToken
  }
  var url = getSlopeUrl('/slope/', tileInfo);
  window.location.href = url;
});

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g',
  center: [86.922623, 27.986065], //Mt Everest
  zoom: 9,
  doubleClickZoom: false
});

// Add a geocoder to the map
map.addControl(new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
}));

// Add a scale control to the map
const scale = new mapboxgl.ScaleControl({
  maxWidth: 80,
  unit: 'metric'
});
map.addControl(scale);
   
scale.setUnit('metric')

map.on('load', function() {
  map.showTileBoundaries = true;
  map.addSource('dem', {
    "type": "raster-dem",
    "url": "mapbox://mapbox.terrain-rgb"
  });
  map.addLayer({
    "id":"hillshading",
    "source": "dem",
    "type": "hillshade"
  }, 'waterway-river-canal-shadow');

  map.addSource('bounding_box_source', {
    type: 'geojson',
    data: {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0]]]
      }
    }
  });

  //set invisible on load
  map.addLayer({
    id : 'bounding_box',
    type : 'fill',
    source : 'bounding_box_source',
    layout: {},
    paint : {
      'fill-color' : '#088',
      'fill-opacity' : 0
    }
  });
});

map.on('dblclick', function(e) {
  var tileInfo = getTileInfo(e.lngLat.lng, e.lngLat.lat, e.target);
  //console.log(tileInfo);
  var url = getUrl('/elevation/', tileInfo);
  //console.log("Requesting: " + url);
  window.location.href = url;
});

map.on('click', function(e) {
  var tileInfo = getTileInfo(e.lngLat.lng, e.lngLat.lat);
  
  //set the name of the download button element to the tile
  $('#download').attr('name', tileInfo.z + "-" + tileInfo.x + "-" + tileInfo.y);

  //set the name of the download-slop button element to the tile
  $('#download-slope').attr('name', tileInfo.metersPerPixel + "-" + tileInfo.z + "-" + tileInfo.x + "-" + tileInfo.y);

  //create the selected tile feature class
  var bb = getTileGeoJsonBB(tileInfo);
  map.getSource('bounding_box_source').setData(bb);
  map.setPaintProperty('bounding_box', 'fill-opacity', 0.45);
  
  //display tile and pixel width information to the user
  $('#tile-width').text(Math.round(tileInfo.tileWidthInMeters * 100) / 100);
  $('#pixel-width').text(Math.round(tileInfo.metersPerPixel * 100) / 100);
  
  $.get(getUrl('/statistics/', tileInfo), function(data, status) {
    $('#elev-min').text(Math.round(data.minHeight * 100) / 100);
    $('#elev-max').text(Math.round(data.maxHeight * 100) / 100);
    $('#elev-range').text(Math.round((data.maxHeight - data.minHeight) * 100) / 100);
  });

  //set the terrain preview
  $.get(getUrl('/elevation-rgb/', tileInfo), function(data, status) {
    $('#preview').attr('src', data);
  });
});

function getTileGeoJsonBB(tileInfo) {
  var bbCoords = {};
  bbCoords.north = tile2lat(tileInfo.y, tileInfo.z);
  bbCoords.south = tile2lat(tileInfo.y + 1, tileInfo.z);
  bbCoords.west = tile2lng(tileInfo.x, tileInfo.z);
  bbCoords.east = tile2lng(tileInfo.x + 1, tileInfo.z);
  var geoJson = {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[bbCoords.west, bbCoords.south],
        [bbCoords.east, bbCoords.south],
        [bbCoords.east, bbCoords.north],
        [bbCoords.west, bbCoords.north],
        [bbCoords.west, bbCoords.south]]]
    }
  };
  return geoJson;
};

function getTileInfo(lng, lat) {
  var zoom = Math.floor(map.getZoom());
  var widthInMeters = 40075016.686 * Math.abs(Math.cos(lat)) / Math.pow(2, zoom);
  var metersPerPixel = widthInMeters / 512;
  return {
    z: zoom,
    x: lng2tile(lng, zoom),
    y: lat2tile(lat, zoom),
    tileWidthInMeters: widthInMeters,
    metersPerPixel: metersPerPixel
  };
};

function getUrl(pathWithAllSlashes, tileInfo) {
  return pathWithAllSlashes + tileInfo.z + '/' + tileInfo.x + '/' + tileInfo.y + '/' + mapboxgl.accessToken;
};

function getSlopeUrl(pathWithAllSlashes, tileInfo) {
  return pathWithAllSlashes + tileInfo.cellsize + '/' + tileInfo.z + '/' + tileInfo.x + '/' + tileInfo.y + '/' + mapboxgl.accessToken;
};

//https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
function lng2tile(lng,zoom) { 
    return (Math.floor((lng+180)/360*Math.pow(2,zoom)));
};

function lat2tile(lat,zoom)  { 
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); 
};

function tile2lng(x, zoom) {
  return x / Math.pow(2, zoom) * 360 - 180;
};

function tile2lat(y, zoom) {
  var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  var radians = Math.atan(Math.sinh(n));
  return radians * 180 / Math.PI;
};
