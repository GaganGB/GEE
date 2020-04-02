var gfc2016 = ee.Image("UMD/hansen/global_forest_change_2017_v1_5"),
var wdpa = ee.FeatureCollection("WCMC/WDPA/current/polygons");
var anamalai = wdpa.filterMetadata('NAME', 'equals', 'Anamalai');
// Number 1

//Adding a layer to the map, to display the anamalai forest region
Map.centerObject(anamalai, 10);
Map.addLayer(gfc2016.clip(anamalai));

//Selecting 'loss' band of the image, so that we can calculate the total loss in the region
var lossImage = gfc2016.select('loss');
var lossImage = lossImage.updateMask(lossImage);

//Multiplying the lossImage image by the area of the pixel and dividiing it by 10000, so that
//we can get the loss in a particular pixel directly in hectares
//(1 square metre = 0.0001 hectare)
var areaOfLoss = lossImage.multiply(ee.Image.pixelArea()).divide(10000);

//Calculating total area loss by adding all the pixels having a loss = 1
var stats = areaOfLoss.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: anamalai,
  scale: 30,
  bestEffort: true
});

print("The total forest area loss (in hectares) :",stats.get('loss'));


// Number 2

//Selecting the band which contains the loss in a particular year
var lossYear = gfc2016.select('lossyear');

//Creating a function to obtain the forest loss in a particular year
var abc = function(yearIndex){
  var lossInYearIndex = lossYear.eq(yearIndex); //To calculate loss in a particular year
  var lossInYearIndex = lossInYearIndex.updateMask(lossInYearIndex);
  //Getting loss of Forest area in hectares (1 square metre = 0.0001 hectare)
  var areaOfLoss = lossInYearIndex.multiply(ee.Image.pixelArea()).divide(10000);
  var stats = areaOfLoss.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: anamalai,
    scale: 30,
    bestEffort: true
    });
  return stats.get('lossyear')
};

// Sequence of values for 'lossyear' which gives loss in year given by the value of 'lossyear'
// Sequence starts from 1 because, 0 value in lossyear is for no loss.
// 1 is for 2001, 2 for 2002 and so on
var y = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];

// Storing all the losses of Forest area in a list
var AreaLossInYearIndex = ee.List([]);
var AreaLossInYearIndex = AreaLossInYearIndex.add(y.map(abc)).get(0);

// To get maximum of all the forest losses in year 2001-2016
var last = ee.Number(ee.List(AreaLossInYearIndex).size()).subtract(1);
var max = ee.List(AreaLossInYearIndex).sort().get(last);
var year = ee.Number.parse(ee.List(AreaLossInYearIndex).indexOf(max)).add(2001);

print("The highest forest loss happened in year:", year);
print("The loss of Forest area in that year (in hectares) :", max);
