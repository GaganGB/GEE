var geometry = /* color: #0b4a8b */ee.Geometry.Point([84.79040416679686, 19.31213559771135]),
    dataset1 = ee.ImageCollection("NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG");

var nighttimeVis = {min: 0.0, max: 60.0};
Map.addLayer(dataset1.select(['avg_rad','cf_cvg']).filterDate('2013-06-01','2013-07-01'), nighttimeVis, 'Jun', false);
Map.addLayer(dataset1.select(['avg_rad','cf_cvg']).filterDate('2013-09-01','2013-10-01'), nighttimeVis, 'Sept', false);
//Map.setCenter(-77.1056, 38.8904, 8);
Map.addLayer(dataset1.select(['avg_rad','cf_cvg']).filterDate('2013-10-01','2013-11-01'), nighttimeVis, 'Oct', false);
//Map.addLayer(dataset.select('cf_cvg'), {min: 0, max: 84}, 'No. of obs', false)
Map.addLayer(dataset1.select(['avg_rad','cf_cvg']).filterDate('2013-11-01','2013-12-01'), nighttimeVis, 'Nov', false);
Map.addLayer(dataset1.select(['avg_rad','cf_cvg']).filterDate('2013-12-01','2014-01-01'), nighttimeVis, 'Dec', false);

// Load Landsat 8 top-of-atmosphere (TOA) input imagery.
var dataset1 = dataset1.select('avg_rad').filterDate('2013-02-01','2014-06-01');

// Define a region of interest as a buffer around a point.
var geom = geometry.buffer(10000);

// Create and print the chart.
print(ui.Chart.image.series(dataset1, geom, ee.Reducer.mean(), 30));
