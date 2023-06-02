var express = require('express');
var router = express.Router();
var fs = require('fs');
var converter = require('terrain-rgb-height');

/* GET elevation. */
router.get('/:zoom/:x/:y/:token', function(req, res) {
    var zoom = req.params.zoom;
    var x = req.params.x;
    var y = req.params.y;
  
    var url = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}@2x.pngraw?access_token=' + req.params.token;
    url = url.replace('{z}', zoom);
    url = url.replace('{x}', x);
    url = url.replace('{y}', y);
    var inputPng = "./public/images/" + req.params.zoom + "-" + req.params.x + "-" + req.params.y + ".png";
    var outputPng = "./public/images/" + req.params.zoom + "-" + req.params.x + "-" + req.params.y + "-sixteen-bit.png";
    var options = {
      inputFilePath: inputPng,
      outputFilePath: outputPng
    };
    if (fs.existsSync(inputPng)) {
      if (fs.existsSync(outputPng)) {
        res.download(outputPng);
      } else {
        converter.convert(options, function() {
          res.download(outputPng);
        });
      }
    } else {
      converter.getTile(url, inputPng, function() {
        converter.convert(options, function() {
          res.download(outputPng);
        });
      });
    }
  });


//future experiment
/* async function convertTileToGeoTIFF(zoom, x, y, pngPath, tiffPath) {
  try {
    // Calculate the geographic extent of the tile
    const n = Math.pow(2, zoom);
    const lon1 = (x / n) * 360.0 - 180.0;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
    const lat1 = (180.0 / Math.PI) * latRad;
    const lon2 = ((x + 1) / n) * 360.0 - 180.0;
    const lat2 = (180.0 / Math.PI) * Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));


    // Load the PNG image using Jimp
    const image = await Jimp.read(pngPath);

    // Convert the image to 16-bit grayscale
    image.rgba(false);

    // Create the GeoTIFF metadata
    const metadata = {
      width: image.bitmap.width,
      height: image.bitmap.height,
      samplesPerPixel: 1,
      bitsPerSample: [16],
      sampleFormat: [GeoTIFF.SampleFormat.UInt],
      photometricInterpretation: GeoTIFF.PhotometricInterpretation.BlackIsZero,
      geoKeys: {
        GTModelTypeGeoKey: GeoTIFF.GTModelTypeGeoKey.ModelTypeProjected,
        GTRasterTypeGeoKey: GeoTIFF.GTRasterTypeGeoKey.RasterPixelIsArea,
        GeographicTypeGeoKey: 4326, // EPSG:4326 (WGS84)
        ProjLinearUnitsGeoKey: GeoTIFF.ProjLinearUnitsGeoKey.Linear_Meter,
        ProjCoordTransGeoKey: GeoTIFF.ProjCoordTransGeoKey.ProjectedCSTypeUserDefined,
        ProjStdParallel1GeoKey: (lat1 + lat2) / 2,
        ProjNatOriginLongGeoKey: (lon1 + lon2) / 2,
      },
      tiePoints: [
        [0, 0, lon1, lat1, 0, 0],
      ],
      pixelScale: [(lon2 - lon1) / image.bitmap.width, (lat2 - lat1) / image.bitmap.height, 0],
    };

    // Create the GeoTIFF file
    const tiffData = await GeoTIFF.fromPixels(image.bitmap.data, metadata);
    await tiffData.writeToFile(tiffPath);

    console.log('Conversion complete');
  } catch (error) {
    console.error('Error converting tile to GeoTIFF:', error);
  }
} */

module.exports = router;


