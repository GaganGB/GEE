var modislst = ee.ImageCollection("MODIS/006/MOD11A2"),
    geometry = /* color: #0b4a8b */ee.Geometry.Point([79.15247595650452, 21.12460135901175]);
var modisLST = modislst.select(['LST_Day_1km', 'LST_Night_1km']);

Map.centerObject(geometry, 13);

// Filtering the image collection for the year 2017
var modislstByTime = modisLST.filter(ee.Filter.date('2019-01-01', '2020-01-01'));

// Reducing image collection to an image by taking maximum and minumum
// values of all the pixels.
var maxImage = modislstByTime.max().multiply(0.02).clip(geometry);
var minImage = modislstByTime.min().multiply(0.02).clip(geometry);
Map.addLayer(maxImage);
Map.addLayer(minImage);

// Function to get the maximum and minimum values of the bands in the image which is
// masked everywhere except for the point in the question.
// Summing all the pixel values in the junkRegion gives the same pixel value which is at the
// point (given in the question) as all the other regions are masked.
var calculation = function(image){
  var junkRegion = geometry.buffer(500);
  var stats = image.reduceRegion({
    geometry: junkRegion,
    scale: 30,
    maxPixels: 1e9,
    reducer: ee.Reducer.sum()
  });
  return stats;
};

// Getting maximum temperature of day and minimum temperature of night.
var max = calculation(maxImage).get('LST_Day_1km');
var min = calculation(minImage).get('LST_Night_1km');

print("The highest daytime land surface temperature in 2017 (in K):", max);
print("The lowest night land surface temperature in 2017 (in K):", min);
