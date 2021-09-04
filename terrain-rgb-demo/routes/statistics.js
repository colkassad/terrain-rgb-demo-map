var express = require('express');
var router = express.Router();
var fs = require('fs');
var converter = require('terrain-rgb-height');

/* GET statistics. */
//gets min/max values for a terrain-rgb tile
router.get('/:zoom/:x/:y/:token', function(req, res) {
    var zoom = req.params.zoom;
    var x = req.params.x;
    var y = req.params.y;
    var url = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}@2x.pngraw?access_token=' + req.params.token;
    url = url.replace('{z}', zoom);
    url = url.replace('{x}', x);
    url = url.replace('{y}', y);
    var tilePath = "./public/images/" + req.params.zoom + "-" + req.params.x + "-" + req.params.y + ".png";
    if (fs.existsSync(tilePath)) {
      //the image has already been fetched, use that
      converter.calculateStatistics(tilePath, function(stats) {
        res.send(stats);
      });
    } else {
      converter.getTile(url, tilePath, function() {
        converter.calculateStatistics(tilePath, function(stats) {
          res.send(stats);
        });
      });
    }
  });

module.exports = router;


