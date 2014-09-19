define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/keys',
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
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/PictureMarkerSymbol',
  'esri/dijit/PopupMobile',
  'app/widgets/basemap_gallery',
  'esri/dijit/Legend',
  'esri/InfoTemplate',
  'esri/geometry/Point',
  'esri/geometry/Extent',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/tasks/FindTask',
  'esri/tasks/FindParameters',
  'esri/tasks/IdentifyParameters',
  'esri/graphic',
  'esri/urlUtils',
  'esri/geometry/webMercatorUtils',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/parser',
  'agsjs/dijit/TOC',
  'dojo/query',
  'app/widgets/bookmarks_dropdown',
  'app/widgets/search_by_category',
  'dojo/on',
  'dojo/text!./templates/search_by_name_modal.html'
], function(declare, array, keys, _WidgetBase, _TemplatedMixin, Scalebar,
            LocateButton, HomeButton, BootstrapMap, all, mapTemplate, poiTemplate,
            listItemTemplate, Color, SimpleLineSymbol, SimpleMarkerSymbol,
            SimpleFillSymbol, PictureMarkerSymbol, PopupMobile, myBasemapGallery,
            Legend, InfoTemplate, Point, Extent,
            EsriQuery, QueryTask, FindTask, FindParameters, IdentifyParameters,
            Graphic, urlUtils, webMercatorUtils, dom, domConstruct, parser,
            TOC, dojoQuery, BookmarksDropdown, SearchByCategoryWidget, on,
            searchByNameModal) {
  
  return declare([_WidgetBase, _TemplatedMixin], {

    constructor: function (opts) {
      var config, _this;

      config = opts.config;
      _this = this;

      dojo.forEach([config.map, config.configs],
          dojo.hitch(this, this._copyProperties));

      this.setDefaultMarkerSymbol();
      this.setBorderSymbol();
      this.setInfoWindow();

      this.identifiableLayers = [];
      this.nameToLayer = {};
      this.widgets = {};
      this.layers = {};
    },

    /* Private Methods*/
    _addModals: function () {
      dojo.create(domConstruct.toDom(searchByNameModal), null, this.domNode);
      dojoQuery('#search-by-name-modal', this.domNode).on('shown.bs.modal', function(e) {
        dojoQuery('input', e.target)[0].focus();
      });
    },

    _copyProperties : function (configItem) {
      for(var property in configItem) {
        if(configItem.hasOwnProperty(property)) {
          this[property] = configItem[property];
        }
      }
    },

    _registerWidget : function (name, widget) {
      this.widgets[name] = widget;
      if(widget.startup) {
        widget.startup();
      }
    },

    _getWidget : function (name) {
      return this.widgets[name];
    },

    _overwriteDefaults : function (defaults, opts) {
      for(var key in opts) {
        if(opts.hasOwnProperty(key)) {
          defaults[key] = opts[key];
        }
      }
    },

    _addLayers: function () {
      var layers, _this;

      _this = this;

      layers = dojo.map(this.featureLayers, function(featureLayer) {
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

      this._registerWidget('layerTOC', layerTOC);
    },

    _addLegend : function (layerInfo) {
      var legendDijit, collapsiblePanel;
      
      legendDijit = new Legend({
        map: this.map,
        layerInfos: layerInfo
      }, 'legend');

      this._registerWidget('legendDijit', legendDijit);
    },

    _addHomeButton : function () {
      var homeButton;

      homeButton = new HomeButton({
        map: this.getMap()
      }, 'home-button');

      this._registerWidget('homeButton', homeButton);
    },

    _initializeMapExtent : function () {
      var map;

      map = this.getMap();

      this.initExtent = new Extent(map.extent.xmin, map.extent.ymin,
          map.extent.xmax, map.extent.ymax, map.spatialReference);

      map.enableScrollWheelZoom();
    },

    getBookmarks : function () {
      return this.featuredPlaces;
    },

    _addBookmarkWidget : function () {
      var bookmarkWidget;

      bookmarkWidget = new BookmarksDropdown({
        bookmarks      : this.getBookmarks(),
        onClickHandler : this.identifyOnMap,
        mapContext     : this,
        attrs          : {
          'class' : 'vt-background-color'
        }
      }, 'featured-bookmarks');

      this._registerWidget('featuredBookmarks', bookmarkWidget);
    },

    _addSearchByCategoryWidget : function () {
      var categoryWidget;

      categoryWidget = new SearchByCategoryWidget({
        onClickHandler : this.identifyOnMap,
        gazeteerLayer  : this.gazeteerLayer,
        mapContext     : this
      }, 'search-by-category-modal');

      this._registerWidget('searchByCategoryWidget', categoryWidget);
    },

    _addWidgets : function () {
      var layerInfos;

      this._addHomeButton();
      this._addScaleBar();
      this._addLocateButton();
      this._addBookmarkWidget();
      this._addSearchByCategoryWidget();

      layerInfos = dojo.map(this.featureLayers, function(featureLayer) {
        return featureLayer.getInfo();
      }).reverse();

      this._addLayerTableOfContents(layerInfos); 
      this._addLegend(layerInfos);
    },

    _attachEventHandlers : function () {
      var map;

      map = this.getMap();

      // Info Window Event Handlers
      map.infoWindow.on('hide', dojo.hitch(this, this.clearGraphics));

      // Map Event Handlers
      map.on('layers-add-result', dojo.hitch(this, this._initializeMapExtent));
      map.on('layers-add-result', dojo.hitch(this, this._addWidgets));
      map.on('click', dojo.hitch(this, this.getInfoOnClickedPoint));

      // NavBar and Search Event Handlers
      dojoQuery('#searchField', this.domNode)
        .on('keydown', dojo.hitch(this, this.doFind));
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

    _setupSearch : function () {
      this.findTask = new FindTask(this.gazeteerLayer + '/');
      this.findParams = new FindParameters();
      this.findParams.searchFields = ['NAME'];
      this.findParams.returnGeometry = true;
      this.findParams.layerIds = [0];
      this.findParams.outSpatialReference = {'wkid': 102100};
    },

    _addScaleBar : function () {
      var scaleBar;

      scaleBar = new Scalebar({
        map: this.getMap(),
        scalebarUnit: 'dual'
      });

      this._registerWidget('scaleBar', scaleBar);
    },

    _addLocateButton : function () {
      var locateButton;

      locateButton = new LocateButton({
        map: this.getMap(),
        scale: 10000,
        symbol: this.getDefaultMarkerSymbol()
      }, 'locate-button');

      this._registerWidget('locateButton', locateButton);
    },

    _addBaseMapGallery : function () {

      new myBasemapGallery({
        basemaps: this.myBasemaps,
        map: this.getMap(),
        defaultBasemapIndex: 0
      }, 'basemap-gallery');

    },

    _initMap: function() {
      dojo.forEach(this.featureLayers,
          dojo.hitch(this, this.setInfoTemplates));
      this._attachEventHandlers(); 
      this._initializeIdentifyParams();
      this._addLayers();
      this._setupSearch();
      this._addBaseMapGallery();
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

      this._overwriteDefaults(defaults, opts);

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

      this._overwriteDefaults(defaults, opts);

      line = new SimpleLineSymbol(defaults.lineStyle, defaults.lineColor,
          defaults.lineWidth);

      this.fillSymbol = new SimpleFillSymbol(defaults.fillSymbolStyle, line,
          defaults.fillSymbolColor);
    },

    setOption: function (key, value) {
      this.options[key] = value;
    },

    getPixelWidth : function () {
      return this.initExtent.getWidth() / this.map.width;
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

      dojo.forEach(layer.getIdentifyLayers(), function (identifyLayer) {

        _this.identifiableLayers.push(identifyLayer.layerName);

        _this.nameToLayer[identifyLayer.layerName] = identifyLayer;

        infoTemplateHTMLString =
          '<table class="table table-hover table-bordered ">';

        dojo.forEach(identifyLayer.fields, function (field) {
          infoTemplateHTMLString += dojo.replace(poiTemplate, {
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
      this._addModals();
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

      dojo.forEach(results, function (identifyResults) {
        dojo.forEach(identifyResults, function (result) {
          var feature, layerName, mapLayerObject;

          layerName = result.layerName;

          feature = result.feature;
          feature.setSymbol(_this.getBorderSymbol());
          feature.attributes.layerName = layerName;

          if (dojo.indexOf(_this.identifiableLayers, layerName) !== -1) {
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

      dojo.map(this.featureLayers, function (layer) {
        var task;

        task = layer.getIdentifyTask();

        if(task && layer.isVisibleNow()) {
          tasks.push(task);
        }
      });
      
      deferreds = dojo.map(tasks, function(task) {
        return task.execute(_this.getIdentifyParams());
      });

      promises = new all(deferreds);

      promises.then(dojo.hitch(this, function(results) {
        this.showInfo(results, evt.mapPoint);
      }));
    },
    /**
    * a utility function that converts a point coordinates to a map extent
    */
    pointToExtent: function (geometry, toleranceInPixel) {
      var pixelWidth, toleraceInMapCoords, pointX, pointY, map;

      pixelWidth = this.getPixelWidth();
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

    /**
    * searches for a building using the building name given by the user
    */
    doFind : function (evt) {
      var searchField;

      if(evt.keyCode !== keys.ENTER) {
        return;
      }

      searchField = dom.byId('searchField');

      dojoQuery('.searchResults-modal').modal('show');
      dom.byId('searchResults').innerHTML = '';
      dom.byId('searchResults').style.display = 'none';
      dom.byId('searchResultsDiv').style.display = 'block';

      this.findParams.searchText = searchField.value;
      this.findTask.execute(this.findParams,
          dojo.hitch(this, this.showSearchResults));

      searchField.value = '';
    },

    identifyOnMap : function(geometry) {
      this.addBorderAndMarkerAtPos(geometry);
      this.zoomToCoordinates(geometry);
    },

    zoomToCoordinates : function (geometry) {
      var shapeExtent;

      shapeExtent = this.pointToExtent(geometry, 80);
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

        dojo.forEach(featureSet.features, function(feature) {
          feature.setSymbol(_this.getBorderSymbol()); 
          _this.addGraphics(feature); 
        });				

        _this.addGraphics(new Graphic(geometry, _this.getDefaultMarkerSymbol()));
      });
    },

    getSearchKeyword : function () {
      return this.findParams.searchText;
    },
    /**
    * Shows the results of searching of a building
    */
    showSearchResults: function (results) {
      var searchResults, _this;

      _this = this;

      this.clearGraphics();

      results.sort(function(a, b) {
        var nameA, nameB;

        nameA = a.feature.attributes.Name.toLowerCase();
        nameB = b.feature.attributes.Name.toLowerCase();

        return (nameA === nameB ? 0 : (nameA < nameB ? -1 : 1));
      });

      searchResults = '<div class="list-group">';

      if(!results.length) {
        searchResults += "Sorry! We couldn't find anything that matches '" +
                          this.getSearchKeyword() + "' .";
      }

      dojo.forEach(results, function(result, index) {
        var attribs;

        attribs = result.feature.attributes;

        /* TODO Use dojox/dtl/Templates instead of dojo.replace
         * when the status changes from Experimental to Mature
         * see http://dojotoolkit.org/reference-guide/1.9/dojox/#website-webapp-infrastructure
         */
        searchResults += dojo.replace(listItemTemplate, {
          id: 'search-result-' + index,
          name : attribs.Name,
          category : '<br>' + attribs.Category,
          addr : attribs.Address !== 'Null' ? '<br>' + attribs.Address : ''
        });
      });
    
      searchResults += '</div>';

      dom.byId('searchResults').innerHTML = searchResults;
      dom.byId('searchResults').style.display = 'block';

      dojoQuery('.list-group').on('a:click', function(evt) {
        var id, index;

        id = evt.target.id;
        index = id[id.length -1];
        _this.identifyOnMap(results[index].feature.geometry);
      });
    },
  });
});
