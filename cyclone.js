
// Dataset of VIIRS
var dataset = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG');

var layerProperties = {
    visParams: {min: -1.5, max: 15, bands:['avg_rad']}
};

//Creating a map Panel
var mapPanel = ui.Map();

//Locations available
var locOpt = {
  'Default': {lat: 22, lon: 78, zoom: 5},
//  'Gaja': {lat: 12.01, lon:79.72, zoom:7, startdate: '2018-11-01', enddate: '2018-12-01'},
  'Vardah': {lat: 12.64, lon:92.85, zoom:7, startdate: '2016-12-01', enddate: '2017-01-01'},
  'Hudhud': {lat: 17.69, lon:83.64, zoom:7, startdate: '2014-10-01', enddate: '2014-11-01'},
  'Phailin': {lat: 19.31, lon: 84.79, zoom:7, startdate: '2013-10-01', enddate: '2013-11-01'},
  'Nilam': {lat: 12.63, lon:80.20, zoom:7, startdate: '2012-11-01', enddate: '2012-12-01'}
}

//Setting control visibility of Map panel
mapPanel.setControlVisibility(
    {all: true});

//Setting a default location
var defaultLocation = locOpt.Default;
mapPanel.setCenter(
    defaultLocation.lon, defaultLocation.lat, defaultLocation.zoom);

//Creating a panel layout
ui.root.widgets().reset([mapPanel]);
ui.root.setLayout(ui.Panel.Layout.flow('horizontal'));

//Header
var header = ui.Label('CYCLONE RECOVERY RATE', {fontSize: '36px', color: 'black'});

var toolPanel = ui.Panel([header], 'flow', {width: '300px'});
ui.root.widgets().add(toolPanel);

//For selecting cyclones out of the drop down
var locations = Object.keys(locOpt);
var locationSelect = ui.Select({
  items: locations,
  value: locations[0],
  onChange: function(value) {
    var location = locOpt[value];
    mapPanel.setCenter(location.lon, location.lat, location.zoom);
    var picture = dataset.select('avg_rad').filterDate(location.startdate,location.enddate).first();
    var geometry = ee.Geometry.Point(location.lon,location.lat);
    var buf = geometry.buffer(1000);
    var sdate = ee.Date(location.startdate).advance(-4, 'month');
    var edate = ee.Date(location.enddate).advance(6, 'month');
    print(ui.Chart.image.series(dataset.select('avg_rad').filterDate(sdate, edate), buf, ee.Reducer.mean(), 500));
    //To get the mean of previous months
    var mean = dataset.select('avg_rad').filterDate(sdate, location.startdate).reduce(ee.Reducer.mean()).reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: buf,
      scale: 500,
      maxPixels: 1e9
    });
    var meanchecker =function (image)
    {
      return image.gte(ee.Image(ee.Number(mean.get('avg_rad_mean'))));
    };
    var dateconv =function (image)
    {
      return ee.Image(image.multiply(ee.Number.parse(image.get('system:index')))).toFloat().clip(buf);
    };

    var replacezero =function (image)
    {
      var repzeromean=image.reduce(ee.Reducer.mean()).reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: buf,
      scale: 500,
      maxPixels: 1e9
    });

      return image.remap([0],[19999999999],repzeromean.get('mean'));
    };
    //print(mean.get('avg_rad_mean'));
    var meano = dataset.select('avg_rad').filterDate(location.startdate, location.enddate).reduce(ee.Reducer.mean()).reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: buf,
      scale: 500,
      maxPixels: 1e9
    });
    var m = function(image){
      var avg = image.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: buf,
        scale: 500,
        maxPixels: 1e9
      });

      return ee.Image(ee.Number(avg.get('avg_rad'))).clip(buf).toFloat();
      //var pic = ee.Image.constant(avg.get('avg_rad_mean'));
      //return pic.addBands(image.select('avg_rad'))
    };

    //print((dataset.select('avg_rad').filterDate(location.enddate, edate)));
    var collection=dataset.select('avg_rad').filterDate(location.enddate, edate).map(m);
    //Map.addLayer((dataset.select('avg_rad').filterDate(location.enddate, edate)).map(m));
    var c=collection.map(meanchecker);
    var d=c.map(dateconv);
    //mapPanel.add(ui.Map.Layer(d, layerProperties));
    var e=d.map(replacezero).min().divide(100);
    var minmin = e.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: buf,
        scale: 500,
        maxPixels: 1e9
      });
      print (minmin.get('remapped'));
    var l = ee.Number(minmin.get('remapped'));
    var x = ee.Date.fromYMD(l.divide(100).int(), l.subtract(l.divide(100).int().multiply(100)), 01);
    print(ee.Number(x.difference(ee.Date(location.startdate), 'month')).round());
    var a = ui.Map.Layer(ee.Image.constant(0));
    mapPanel.add(a);
    mapPanel.remove(a);
    a = ui.Map.Layer(picture.clip(geometry.buffer(100000)), layerProperties, 'before');
    mapPanel.add(a);
    var b = ui.Map.Layer(ee.Image.constant(0));
    mapPanel.add(b);
    mapPanel.remove(b);
    b = ui.Map.Layer((dataset.select('avg_rad').filterDate(x.advance(-1, 'month'), x)).first().clip(geometry.buffer(100000)));
    mapPanel.add(b, layerProperties, 'after');

    }
  });

var locationPanel = ui.Panel([
  ui.Label('Choose Cyclone', {'font-size': '24px'}), locationSelect
]);
toolPanel.add(locationPanel);

var opacitySlider = ui.Slider({
  min: 0,
  max: 1,
  value: 1,
  step: 0.01,
});
opacitySlider.onSlide(function(value) {
  mapPanel.layers().forEach(function(element, index) {
    element.setOpacity(value);
  });
});

var viewPanel = ui.Panel([
  ui.Label('Opacity Slider', {'font-size': '24px'}), opacitySlider
]);
toolPanel.add(viewPanel);
