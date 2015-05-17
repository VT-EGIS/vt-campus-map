define([
  'dojo/_base/declare',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'vtCampusMap/config',
  'dojo/_base/lang',
  'esri/graphic',
  'esri/geometry/webMercatorUtils',
  'esri/geometry/Point',
  'dojo/_base/array'
], function (declare, EsriQuery, QueryTask, config, lang, Graphic,
             webMercatorUtils, Point, array) {
  return declare([], {
    zoomLevel: 18,

    constructor: function (opts) {
      lang.mixin(this, opts);
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
      this.map.infoWindow.hide();

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
