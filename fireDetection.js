// Use AS = Australia, IN = India, VM = Vietnam, CT = Central Republic of Africa, OD = South Sudan

var Country = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017').filterMetadata('country_co','equals','AS').geometry();
Map.centerObject(Country, 3);


var firedata = ee.ImageCollection('FIRMS').select('T21');
var fire = firedata.filter(ee.Filter.date('2019-12-01','2020-01-31'));


var Countryfire = fire.reduce(ee.Reducer.mean()).clip(Country);
var Countryfire = Countryfire.updateMask(Countryfire);
var firesVis = {
  min: 325.0,
  max: 400.0,
  palette: ['red', 'orange', 'yellow'],
};
Map.addLayer(Countryfire, firesVis, '2020');

// Uncomment to show the fires everywhere around the world
Map.addLayer(fire, firesVis, 'World');


var areaOfLoss = Countryfire.not().not().multiply(ee.Image.pixelArea()).divide(10000);

var stats = areaOfLoss.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: Country,
  scale: 30,
  bestEffort: true
});

print("The total forest area loss (in hectares) :",stats.get('T21_mean'));


var dataset = ee.ImageCollection('MODIS/006/MCD12Q1');
var igbpLandCover = dataset.select('LC_Type1').filterDate('2018-01-01','2019-12-31').filterBounds(Country).first();
var image = igbpLandCover.clip(Country);
var igbpLandCoverVis = {
  min: 1.0,
  max: 17.0,
  palette: [
    '05450a', '086a10', '54a708', '78d203', '009900', 'c6b044', 'dcd159',
    'dade48', 'fbff13', 'b6ff05', '27ff87', 'c24f44', 'a5a5a5', 'ff6d4c',
    '69fff8', 'f9ffa4', '1c0dff'
  ],
};
Map.addLayer(image, igbpLandCoverVis, 'LandCover');
