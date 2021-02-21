var dataset = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG');

var layerProperties = {
    visParams: {min: -1.5, max: 340573, bands:['avg_rad']}
};

var mapPanel = ui.Map();
var locOpt = {
  'Default': {lat: 22, lon: 78, zoom: 5},
  'Gaja': {lat: 12.01, lon:79.72, zoom:7, startdate: '2018-11-01', enddate: '2018-12-01'},
  'Vardah': {lat: 12.64, lon:92.85, zoom:7, startdate: '2016-12-01', enddate: '2017-01-01'},
  'Hudhud': {lat: 17.69, lon:83.64, zoom:7, startdate: '2014-10-01', enddate: '2014-11-01'},
  'Phailin': {lat: 19.31, lon: 84.79, zoom:7, startdate: '2013-10-01', enddate: '2013-11-01'},
  'Nilam': {lat: 12.63, lon:80.20, zoom:7, startdate: '2012-11-01', enddate: '2012-12-01'}
}

mapPanel.setControlVisibility(
    {all: true, zoomControl: true, mapTypeControl: true});

var defaultLocation = locOpt.Default;
mapPanel.setCenter(
    defaultLocation.lon, defaultLocation.lat, defaultLocation.zoom);

ui.root.widgets().reset([mapPanel]);
ui.root.setLayout(ui.Panel.Layout.flow('horizontal'));

var header = ui.Label('CYCLONE RECOVERY RATE', {fontSize: '36px', color: 'black'});

var toolPanel = ui.Panel([header], 'flow', {width: '300px'});
ui.root.widgets().add(toolPanel);

var locations = Object.keys(locOpt);
var locationSelect = ui.Select({
  items: locations,
  value: locations[0],
  onChange: function(value) {
    var location = locOpt[value];
    mapPanel.setCenter(location.lon, location.lat, location.zoom);
    print(location);
    var picture = dataset.select('avg_rad').filterDate(location.startdate,location.enddate).first();
    print(picture);
    var geometry = ee.Geometry.Point(location.lon,location.lat);
    mapPanel.add(ui.Map.Layer(picture, layerProperties, 'avg_rad'));
    mapPanel.add(ui.Map.Layer(geometry));
    var buf = geometry.buffer(1000);
    print(ee.Date(location.startdate));
    // var sdate = ee.Date.fromYMD(ee.Date(location.startdate).get('year'),ee.Date(location.startdate).get('month').subtract(4),ee.Date(location.startdate).get('day'));
    // var edate = ee.Date.fromYMD(ee.Date(location.startdate).get('year'),ee.Date(location.startdate).get('month').add(6),ee.Date(location.startdate).get('day'));
    var sdate = ee.Date(location.startdate).advance(-4, 'month');
    var edate = ee.Date(location.enddate).advance(6, 'month');
    print(ui.Chart.image.series(dataset.select('avg_rad').filterDate(sdate, edate), buf, ee.Reducer.mean(), 500));
    var mean = dataset.select('avg_rad').filterDate(sdate, location.startdate).reduce(ee.Reducer.mean()).reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: buf,
      scale: 500,
      maxPixels: 1e9
    });
    print(mean.get('avg_rad_mean'));
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
      return ee.Image(avg);
      //var pic = ee.Image.constant(avg.get('avg_rad_mean'));
      //return pic.addBands(image.select('avg_rad'))
    }
    print(meano.get('avg_rad_mean'));
    print((dataset.select('avg_rad').filterDate(location.enddate, edate)));
    mapPanel.add(ui.Map.Layer((dataset.select('avg_rad').filterDate(location.enddate, edate)).map(m), layerProperties, 'avg_rad'));
    // Map.addLayer((dataset.select('avg_rad').filterDate(location.enddate, edate)).map(m));
    print(collection);
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
