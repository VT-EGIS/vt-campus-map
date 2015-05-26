define([
  'dojo/_base/declare',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'vtCampusMap/config',
  'dojo/_base/lang',
  'esri/graphic',
  'dojo/_base/array'
], function (declare, EsriQuery, QueryTask, config, lang, Graphic, array) {
  return declare([], {
    _zoomLevel: 18,

    /*
     * options
     *  map: esri/map
     *  layerId: string, ID of the layer where the place/building can be searched for 
     *  borderSymbol: esri/symbols/SimpleFillSymbol
     *  markerSymbol: esri/symbols/PictureMarkerSymbol
     */
    constructor: function (opts) {
      lang.mixin(this, opts);
    },

    _getBuildingInfo: function (geometry) {
      var query, task;

      query = new EsriQuery();
      query.outSpatialReference = config.spatialReference;
      query.geometry = geometry;
      query.returnGeometry = true;

      task = new QueryTask(this.map.getLayer(this.layerId).url + '/0');
      return task.execute(query);
    },

    _addBorderAndMarker: function (featureSet, geometry) {
      this.map.graphics.clear();
      this.map.infoWindow.hide();

      array.forEach(featureSet.features, lang.hitch(this, function (feature) {
        feature.setSymbol(this.borderSymbol);
        this.map.graphics.add(feature);
      }));
      this.map.graphics.add(new Graphic(geometry, this.markerSymbol));
    },

    /*
     * Identifies a location on the map by drawing a border around it if it's
     * a building, positioning a marker image on it, centering the map and
     * zooming into that location 
     *
     * geometry: esri/geometry/Geometry in web mercator units
     */
    identify: function (geometry) {
      this._getBuildingInfo(geometry).then(lang.hitch(this, function (featureSet) {
        this._addBorderAndMarker(featureSet, geometry);
      }));
      this.map.centerAndZoom(geometry, this._zoomLevel);
    },
  });
});
