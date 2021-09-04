var express = require('express');
var router = express.Router();
var fs = require('fs');
var converter = require('terrain-rgb-height');

//gets a 32 PNG with heights scaled from 0 to 255...used for preview images
router.get('/:zoom/:x/:y/:token', function(req, res) {
    var zoom = req.params.zoom;
    var x = req.params.x;
    var y = req.params.y;
    var url = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}@2x.pngraw?access_token=' + req.params.token;
    url = url.replace('{z}', zoom);
    url = url.replace('{x}', x);
    url = url.replace('{y}', y);
    var inputPng = "./public/images/" + req.params.zoom + "-" + req.params.x + "-" + req.params.y + ".png";
    var outputPng = "./public/images/" + req.params.zoom + "-" + req.params.x + "-" + req.params.y + "-thirtytwo-bit.png";
    var options = {
      inputFilePath: inputPng,
      outputFilePath: outputPng
    };
    
    if (fs.existsSync(inputPng)) {
      
      if(fs.existsSync(outputPng)) {
        var data = outputPng.replace('/public', '');
        res.send(data);
      } else {
        converter.convert32(options, function() {
          var data = outputPng.replace('/public', '');
          res.send(data);
        });
      }
    } else {
      converter.getTile(url, inputPng, function() {
        converter.convert32(options, function() {
          var data = outputPng.replace('/public', '');
          res.send(data);
        });
      });
    }
});

module.exports = router;