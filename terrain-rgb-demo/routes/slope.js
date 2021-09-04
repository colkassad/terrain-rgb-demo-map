var express = require('express');
var router = express.Router();
var fs = require('fs');
var converter = require('terrain-rgb-height');
var slope = require('terrain-rgb-slope');

/* GET slope. */
//gets a 16 bit greyscale slope PNG (integer percent value)
router.get('/:cellsize/:zoom/:x/:y/:token', function(req, res) {
    var cellsize = req.params.cellsize;
    var zoom = req.params.zoom;
    var x = req.params.x;
    var y = req.params.y;
    var url = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}@2x.pngraw?access_token=' + req.params.token;
    url = url.replace('{z}', zoom);
    url = url.replace('{x}', x);
    url = url.replace('{y}', y);
    var inputPng = "./public/images/" + req.params.zoom + "-" + req.params.x + "-" + req.params.y + ".png";
    var outputPng = "./public/images/" + req.params.zoom + "-" + req.params.x + "-" + req.params.y + "-slope.png";
    var options = {
      inputFilePath: inputPng,
      outputFilePath: outputPng,
      cellsize: cellsize
    };
    if (fs.existsSync(inputPng)) {
      if(fs.existsSync(outputPng)) {
        res.download(outputPng);
      } else {
        slope.convertToSlope(options, function() {
          res.download(outputPng);
        });
      }
    } else {
      converter.getTile(url, inputPng, function() {
        slope.convertToSlope(options, function() {
          res.download(outputPng);
        });
      });
    }
  });

module.exports = router;


