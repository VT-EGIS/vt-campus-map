define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'esri/dijit/Scalebar',
  'esri/dijit/LocateButton',
  'esri/dijit/HomeButton',
  'bootstrapMap',
  'dojo/promise/all',
  'dojo/text!./templates/vt_campus_map.html',
  'dojo/text!./templates/point_of_interest_info.html',
  'dojo/text!./templates/list_of_items_in_modal.html',
  'esri/Color',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/PictureMarkerSymbol',
  'esri/dijit/PopupMobile',
  'esri/dijit/Legend',
  'esri/InfoTemplate',
  'esri/geometry/Point',
  'esri/geometry/Extent',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/tasks/IdentifyParameters',
  'esri/graphic',
  'esri/urlUtils',
  'esri/geometry/webMercatorUtils',
  'dojo/dom-construct',
  'dojo/parser',
  'agsjs/dijit/TOC',
  'app/widgets/search_by_category',
  'dojo/on',
  'app/widgets/search_by_name',
  'dojo/_base/lang',
  'dojo/_base/array'
], function(declare, _WidgetBase, _TemplatedMixin, Scalebar, LocateButton,
            HomeButton, BootstrapMap, all, mapTemplate, poiTemplate,
            listItemTemplate, Color, SimpleLineSymbol, SimpleFillSymbol,
            PictureMarkerSymbol, PopupMobile, Legend, InfoTemplate, Point,
            Extent, EsriQuery, QueryTask, IdentifyParameters, Graphic, urlUtils,
            webMercatorUtils, domConstruct, parser, TOC,
            SearchByCategoryWidget, on, SearchByNameWidget, lang, array) {
  
  return declare([_WidgetBase, _TemplatedMixin], {

    constructor: function (opts) {
      var config, _this;

      config = opts.config;
      _this = this;

      lang.mixin(this, config.map);
      lang.mixin(this, config.configs);

      this.setDefaultMarkerSymbol();
      this.setBorderSymbol();
      this.setInfoWindow();

      this.identifiableLayers = [];
      this.nameToLayer = {};
      this.widgets = {};
      this.layers = {};
    },

    _addLayers: function () {
      var layers, _this;

      _this = this;

      layers = array.map(this.featureLayers, function(featureLayer) {
        _this.layers[featureLayer.getLabel()] = featureLayer;
        return featureLayer.load();
      });

      this.map.addLayers(layers);
    },

    _addLayerTableOfContents : function (layerInfo) {
      var layerTOC;

      layerTOC = new TOC({
        map: this.getMap(),
        layerInfos: layerInfo
      }, 'layers');

      layerTOC.startup();
    },

    _addLegend : function (layerInfo) {
      var legendDijit;
      
      legendDijit = new Legend({
        map: this.map,
        layerInfos: layerInfo
      }, 'legend');

      legendDijit.startup();
    },

    _addHomeButton : function () {
      var homeButton;

      homeButton = new HomeButton({
        map: this.getMap()
      }, 'home-button');

      homeButton.startup();
    },

    _initializeMapExtent : function () {
      var map;

      map = this.getMap();

      this.initExtent = new Extent(map.extent.xmin, map.extent.ymin,
          map.extent.xmax, map.extent.ymax, map.spatialReference);

      map.enableScrollWheelZoom();
    },

    _addSearchByCategoryWidget : function () {
      var categoryWidget;

      categoryWidget = new SearchByCategoryWidget({
        onClickHandler : this.identifyOnMap,
        gazeteerLayer  : this.gazeteerLayer,
        mapContext     : this
      }, 'search-by-category-modal');
    },

    getOnClickHandler : function () {
      return this.identifyOnMap.bind(this);
    },

    _addSearchByNameWidget : function () {
      var searchByNameWidget;

      searchByNameWidget = new SearchByNameWidget({
        onClickHandler : this.identifyOnMap,
        gazeteerLayer  : this.gazeteerLayer,
        mapContext     : this
      }, 'search-by-name-modal');
    }, 

    _addWidgets : function () {
      var layerInfos;

      this._addHomeButton();
      this._addScaleBar();
      this._addLocateButton();
      this._addSearchByCategoryWidget();
      this._addSearchByNameWidget();

      layerInfos = array.map(this.featureLayers, function(featureLayer) {
        return featureLayer.getInfo();
      }).reverse();

      this._addLayerTableOfContents(layerInfos); 
      this._addLegend(layerInfos);
    },

    _attachEventHandlers : function () {
      var map;

      map = this.getMap();

      // Info Window Event Handlers
      map.infoWindow.on('hide', lang.hitch(this, this.clearGraphics));

      // Map Event Handlers
      map.on('layers-add-result', lang.hitch(this, this._initializeMapExtent));
      map.on('layers-add-result', lang.hitch(this, this._addWidgets));
      map.on('click', lang.hitch(this, this.getInfoOnClickedPoint));
    },

    _initializeIdentifyParams : function () {
      var map;

      map = this.getMap();

      this.identifyParams = new esri.tasks.IdentifyParameters();
      this.identifyParams.tolerance = 5;
      this.identifyParams.returnGeometry = true;
      this.identifyParams.layerOption =
        esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
      this.identifyParams.mapExtent = map.extent;
      this.identifyParams.width  = map.width;
      this.identifyParams.height = map.height;	  		
    },

    _addScaleBar : function () {
      var scaleBar;

      scaleBar = new Scalebar({
        map: this.getMap(),
        scalebarUnit: 'dual'
      });
    },

    _addLocateButton : function () {
      var locateButton;

      locateButton = new LocateButton({
        map: this.getMap(),
        scale: 10000,
        symbol: this.getDefaultMarkerSymbol()
      }, 'locate-button');

      locateButton.startup();
    },

    _initMap: function() {
      array.forEach(this.featureLayers,
          lang.hitch(this, this.setInfoTemplates));
      this._attachEventHandlers(); 
      this._initializeIdentifyParams();
      this._addLayers();
    },

    showInfoWindow : function (point) {
      this.map.infoWindow.show(point);
    },

    _checkQueryParameters : function () {
      var urlObject;
      
      urlObject = urlUtils.urlToObject(document.location.href);

      if (urlObject.query && urlObject.query.lon && urlObject.query.lat) {
        var lon = parseFloat(urlObject.query.lon);
        var lat = parseFloat(urlObject.query.lat);
        this.setOption('center', [lon, lat]);
        this.setOption('zoom', 7);
      }
    },

    /* Public Methods*/
    templateString: mapTemplate,

    hideInfoWindow : function () {
      this.map.infoWindow.hide();
    },

    clearInfoWindow : function () {
      this.map.infoWindow.clearFeatures();
    },

    clearGraphics: function () {
      this.map.graphics.clear();
      this.hideInfoWindow();
    },

    addGraphics : function (graphic) {
      this.map.graphics.add(graphic);
    },

    setInfoWindowFeatures : function (features) {
        this.map.infoWindow.setFeatures(features);
    },

    setIdentifyParams : function (opts) {
      for(var key in opts) {
        if(opts.hasOwnProperty(key)) {
          this.identifyParams[key] = opts[key];
        }
      }
    },

    setMap: function () {
      this.map = BootstrapMap.create(this.mapNode, this.options);
    },

    setInfoWindow : function () {
      var element;

      element = domConstruct.create('div');
      this.options.infoWindow = new PopupMobile(null, element);
    },

    setDefaultMarkerSymbol : function (opts) {
      var defaults;

      opts = opts || {};

      defaults = {
        url     : this.PictureMarker,
        width   : 24,
        height  : 50,
        markerType : PictureMarkerSymbol
      };

      lang.mixin(defaults, opts);

      this._defaultMarkerSymbol = new defaults.markerType(defaults.url,
          defaults.width, defaults.height);
    },

    setBorderSymbol : function (opts) {
      var defaults, line;

      opts = opts || {};

      defaults = {
        lineWidth       : 5,
        lineColor       : new Color([255, 0, 0]),
        fillSymbolColor : new Color([255, 255, 0, 0.5]),
        lineStyle       : SimpleLineSymbol.STYLE_SOLID,
        fillSymbolStyle : SimpleFillSymbol.STYLE_SOLID
      };

      lang.mixin(defaults, opts);

      line = new SimpleLineSymbol(defaults.lineStyle, defaults.lineColor,
          defaults.lineWidth);

      this.fillSymbol = new SimpleFillSymbol(defaults.fillSymbolStyle, line,
          defaults.fillSymbolColor);
    },

    setOption: function (key, value) {
      this.options[key] = value;
    },

    /**
     * Gets the URL of the layer given the layer name.
     */
    getLayerUrl : function (layerName) {
      return this.layers[layerName].getUrl();
    },

    getFeatureLayers : function () {
      return this.featureLayers;
    },

    getIdentifyParams : function () {
      return this.identifyParams;
    },

    setInfoTemplates : function (layer) {
      var _this, infoTemplateHTMLString;

      _this = this;

      array.forEach(layer.getIdentifyLayers(), function (identifyLayer) {

        _this.identifiableLayers.push(identifyLayer.layerName);

        _this.nameToLayer[identifyLayer.layerName] = identifyLayer;

        infoTemplateHTMLString =
          '<table class="table table-hover table-bordered ">';

        array.forEach(identifyLayer.fields, function (field) {
          infoTemplateHTMLString += lang.replace(poiTemplate, {
            title : field.title,
            value : field.value
          });
        });

        infoTemplateHTMLString += '</table>';

        identifyLayer.infoTemplate = new esri.InfoTemplate({
          title: identifyLayer.title,
          content: infoTemplateHTMLString
        });
      });
    },

    getBorderSymbol: function () {
      return this.fillSymbol;
    },

    getMap : function () {
      return this.map;
    },

    getDefaultMarkerSymbol : function () {
      return this._defaultMarkerSymbol;
    },

    postCreate: function() {
      this.inherited(arguments);
      this._checkQueryParameters();
      this.setMap();
      this._initMap();
    },

    /**
      * Update the second drop down menu with the options corresponding
      * to the category selected in the first drop down menu.
      * the options are retrieved by quering the mapservice
      * layer corresponding to the category selected.
      */

    showInfo: function (results, clickedPoint) {
      var features, _this;

      features = [];
      _this = this;

      array.forEach(results, function (identifyResults) {
        array.forEach(identifyResults, function (result) {
          var feature, layerName, mapLayerObject;

          layerName = result.layerName;

          feature = result.feature;
          feature.setSymbol(_this.getBorderSymbol());
          feature.attributes.layerName = layerName;

          if (array.indexOf(_this.identifiableLayers, layerName) !== -1) {
            mapLayerObject = _this.nameToLayer[layerName];
            feature.setInfoTemplate(mapLayerObject.infoTemplate);
            features.push(feature);
          }	
        });
      });

      if (features.length > 0) {
        this.setInfoWindowFeatures(features);
        this.showInfoWindow(clickedPoint);
      }
    },
      
    getInfoOnClickedPoint : function (evt) { 
      var tasks, _this, deferreds, map, promises;

      _this = this;
      map = this.getMap();
      tasks = [];

      this.hideInfoWindow();
      this.clearInfoWindow();
      this.clearGraphics(); 
      this.setIdentifyParams({
        mapExtent : map.extent,
        geometry  : this.pointToExtent(evt.mapPoint, this.pointTolerance)
      });

      array.map(this.featureLayers, function (layer) {
        var task;

        task = layer.getIdentifyTask();

        if(task && layer.isVisibleNow()) {
          tasks.push(task);
        }
      });
      
      deferreds = array.map(tasks, function(task) {
        return task.execute(_this.getIdentifyParams());
      });

      promises = new all(deferreds);

      promises.then(lang.hitch(this, function(results) {
        this.showInfo(results, evt.mapPoint);
      }));
    },
    /**
    * a utility function that converts a point coordinates to a map extent
    */
    pointToExtent: function (geometry, toleranceInPixel) {
      var pixelWidth, toleraceInMapCoords, pointX, pointY, map;

      pixelWidth = this.initExtent.getWidth() / this.map.width;
      map = this.getMap();
      toleraceInMapCoords = toleranceInPixel * pixelWidth;
      if(!geometry.type || geometry.type !== 'point') {
        geometry = this.getMercatorPoint(geometry.lng, geometry.lat);
      }
      pointX = geometry.x;
      pointY = geometry.y;

      return new Extent(
          pointX - toleraceInMapCoords,
          pointY - toleraceInMapCoords,
          pointX + toleraceInMapCoords,
          pointY + toleraceInMapCoords,
          map.spatialReference); 
    },

    identifyOnMap : function(geometry) {
      this.addBorderAndMarkerAtPos(geometry);
      this.zoomToCoordinates(geometry);
    },

    zoomToCoordinates : function (geometry) {
      var shapeExtent;

      shapeExtent = this.pointToExtent(geometry, 40);
      this.getMap().setExtent(shapeExtent);
    },

    getMercatorPoint : function (lng, lat) {
      var point;

      point = new Point(lng, lat);
      return webMercatorUtils.geographicToWebMercator(point);
    },

    addBorderAndMarkerAtPos : function (geometry) {
      var map, buildingQuery, buildingQueryTask, _this;

      map = this.getMap();
      if(!geometry.type || geometry.type !== 'point') {
        geometry = this.getMercatorPoint(geometry.lng, geometry.lat);
      }
      _this = this;

      buildingQuery = new EsriQuery(); 
      buildingQuery.outSpatialReference = {'wkid': 102100};
      buildingQuery.returnGeometry = true; 
      buildingQuery.geometry = geometry; 

      buildingQueryTask = new QueryTask(this.getLayerUrl('Buildings') + '/0');
      buildingQueryTask.execute(buildingQuery, function(featureSet) { 
        _this.clearGraphics();

        array.forEach(featureSet.features, function(feature) {
          feature.setSymbol(_this.getBorderSymbol()); 
          _this.addGraphics(feature); 
        });				

        _this.addGraphics(new Graphic(geometry, _this.getDefaultMarkerSymbol()));
      });
    }
  });
});
