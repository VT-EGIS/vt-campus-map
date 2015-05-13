define([
  'dojo/_base/declare',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'vtCampusMap/config',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'dojo/_base/lang',
  'esri/Color',
  'esri/graphic',
  'esri/geometry/webMercatorUtils',
  'esri/geometry/Point',
  'dojo/_base/array'
], function (declare, EsriQuery, QueryTask, config, SimpleLineSymbol,
             SimpleFillSymbol, lang, Color, Graphic, webMercatorUtils, Point,
             array) {
  return declare([], {
    zoomLevel: 17,

    lineColor: new Color([255, 0, 0]),

    fillColor: new Color([255, 255, 0, 0.5]),

    constructor: function (opts) {
      lang.mixin(this, opts);

      this.borderSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, this.lineColor, 5),
          this.fillColor);
    },

    getBuildingInfo: function (geometry) {
      var query, task;

      query = new EsriQuery();
      query.outSpatialReference = config.spatialReference;
      query.geometry = geometry;
      query.returnGeometry = true;

      task = new QueryTask(this.map.getLayer('Buildings').url + '/0');
      return task.execute(query);
    },

    addBorderAndMarker: function (featureSet, geometry) {
      this.map.graphics.clear();

      array.forEach(featureSet.features, lang.hitch(this, function (feature) {
        feature.setSymbol(this.borderSymbol);
        this.map.graphics.add(feature);
      }));
      this.map.graphics.add(new Graphic(geometry, this.markerSymbol));
    },

    identify: function (geometry) {
      if(!geometry.type || geometry.type !== 'point') {
        geometry = webMercatorUtils.geographicToWebMercator(new Point(geometry.lng, geometry.lat));
      }
      this.getBuildingInfo(geometry).then(lang.hitch(this, function (featureSet) {
        this.addBorderAndMarker(featureSet, geometry);
      }));
      this.map.centerAndZoom(geometry, this.zoomLevel);
    },
  });
});
