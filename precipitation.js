var geometry = /* color: #98ff00 */ee.Geometry.Polygon(
        [[[77.44749260114486, 13.086051482438156],
          [77.44749260114486, 12.792938044707729],
          [77.78532219098861, 12.792938044707729],
          [77.78532219098861, 13.086051482438156]]], null, false),
    chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY");
var start = '2018-01-01';
var end = '2018-12-01';

Map.centerObject(geometry, 10);

// Filtering the data from the given start and end date.
// Reducing the image collection across all the dates in the given time using sum of all the
// individual images. Gives the total precipitation in a pixel in the given duration.
var rainfall = (chirps.filter(ee.Filter.date(start, end))).sum();

Map.addLayer(rainfall.clip(geometry), {palette: ['FF0000', '000000'], min:650, max:900});

// Taking the mean of all the pixels over the given region to get the
// average cumulative rainfall.
var stats = rainfall.reduceRegion({
  geometry: geometry,
  scale: 30,
  maxPixels: 1e9,
  reducer: ee.Reducer.mean()
});

print("The average cumulative rainfall over the region in 2018 (in mm) :", stats.get('precipitation'));
