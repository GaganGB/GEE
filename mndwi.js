var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[78.18011657482373, 17.627294772942545],
          [78.18011657482373, 17.16863374698936],
          [78.74316589122998, 17.16863374698936],
          [78.74316589122998, 17.627294772942545]]], null, false),
    s2image = ee.Image("COPERNICUS/S2/20180104T051209_20180104T051446_T43QHV");
    var image = s2image.clip(geometry);
Map.addLayer(image, {min:400, max: 3200, bands:['B4', 'B3', 'B2'], gamma:1.2}, 'Image');
Map.centerObject(geometry, 10);
// Use MNDWI (Modified Normalized Difference Water Index) to detect surface water bodies
// MNDWI is computed using the Green and SWIR bands
var mndwi_bands = ['B3', 'B11'];

// Finding mndwi. MNDWI is the same as finding NDVI using B5 and B4 bands, but with Green(B3) and
// SWIR(B11) bands
var mndwi = image.normalizedDifference(mndwi_bands).rename('MNDWI');
Map.addLayer(mndwi);

// Function Otsu's method of segmentation obtained from resource on google earth engine.
// Link: https://medium.com/google-earth/otsus-method-for-image-segmentation-f5c48f405e
var otsu = function(histogram) {
  var counts = ee.Array(ee.Dictionary(histogram).get('histogram'));
  var means = ee.Array(ee.Dictionary(histogram).get('bucketMeans'));
  var size = means.length().get([0]);
  var total = counts.reduce(ee.Reducer.sum(), [0]).get([0]);
  var sum = means.multiply(counts).reduce(ee.Reducer.sum(), [0]).get([0]);
  var mean = sum.divide(total);

  var indices = ee.List.sequence(1, size);

  // Compute between sum of squares, where each mean partitions the data.
  var bss = indices.map(function(i) {
    var aCounts = counts.slice(0, 0, i);
    var aCount = aCounts.reduce(ee.Reducer.sum(), [0]).get([0]);
    var aMeans = means.slice(0, 0, i);
    var aMean = aMeans.multiply(aCounts)
        .reduce(ee.Reducer.sum(), [0]).get([0])
        .divide(aCount);
    var bCount = total.subtract(aCount);
    var bMean = sum.subtract(aCount.multiply(aMean)).divide(bCount);
    return aCount.multiply(aMean.subtract(mean).pow(2)).add(
           bCount.multiply(bMean.subtract(mean).pow(2)));
  });

  print(ui.Chart.array.values(ee.Array(bss), 0, means));

  // Return the mean value corresponding to the maximum BSS.
  return means.sort(bss).get([-1]);
};

// Calculation of histogram of mndwi image.
var histogram = mndwi.reduceRegion({
  reducer: ee.Reducer.histogram(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e9
});

// Calling otsu function by passing the calculated histogram to get the optimized threshold mndwi
// for the given geometry.
var threshold = otsu(histogram.get('MNDWI'));
print('Optimal MNDWI threshold for the given image is: ', threshold);

// Selecting the values of mndwi which are below threshold value to segment the given region
// based on mndwi
var waterBodies = mndwi.select('MNDWI').gt(threshold);
Map.addLayer(waterBodies.mask(waterBodies), {palette: '0000FF'}, 'Water Bodies');
