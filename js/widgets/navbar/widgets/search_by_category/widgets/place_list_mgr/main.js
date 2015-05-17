define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_Container',
  'dojo/_base/array',
  'dojo/_base/lang',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'vtCampusMap/config',
  './widgets/place_list/main'
], function (declare, _WidgetBase, _Container, array, lang, EsriQuery,
             QueryTask, config, PlaceList) {
  return declare([_WidgetBase, _Container], {
    postCreate: function () {
      array.forEach(this.categoryNames, lang.hitch(this, 'loadPlaces'));
      this.activeCategoryList = null;
      this.categoryLists = [];
    },

    loadPlaces: function (categoryName) {
      var query, queryTask;

      query = new EsriQuery();  
      query.returnGeometry = true; 
      query.outFields = ['Name', 'OBJECTID_12'];
      query.where = "Category = '" + categoryName + "'";
      query.orderByFields = ['Name ASC'];
      query.outSpatialReference = config.spatialReference;

      queryTask = new QueryTask(config.gazeteerLayerUrl);

      queryTask.execute(query, lang.hitch(this, function(fset) {
        var placeList;

        placeList = new PlaceList({
          features: fset.features,
          map: this.map,
          markerSymbol: this.markerSymbol
        });
        this.categoryLists[categoryName] = placeList;
        this.addChild(placeList);
      }));
    },

    showPlaceListFor: function (categoryName) {
      this.activeCategoryList && this.activeCategoryList.hide();
      this.categoryLists[categoryName].show();
      this.activeCategoryList = this.categoryLists[categoryName];
    }
  });
});