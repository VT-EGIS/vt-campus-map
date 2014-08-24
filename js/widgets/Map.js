define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/keys',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'esri/dijit/Scalebar',
  'esri/dijit/LocateButton',
  'esri/dijit/HomeButton',
  'components/bootstrapmap/bootstrapmap',
  'dojo/promise/all',
  'dojo/text!./templates/Map.html',
  'dojo/text!./templates/point_of_interest_info.html',
  'dojo/text!./templates/list_of_items_in_modal.html',
  'esri/dijit/Bookmarks',
  'esri/Color',
  'esri/symbols/SimpleLineSymbol',
	'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/PictureMarkerSymbol',
  'esri/dijit/PopupMobile',
  'esri/dijit/BasemapGallery',
  'esri/dijit/BasemapLayer',
  'esri/dijit/Basemap',
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
  'dojo/query'
], function(declare, array, keys, _WidgetBase, _TemplatedMixin, Scalebar,
            LocateButton, HomeButton, BootstrapMap, all, mapTemplate, poiTemplate,
            listItemTemplate, Bookmarks, Color, SimpleLineSymbol, SimpleMarkerSymbol,
            SimpleFillSymbol, PictureMarkerSymbol, PopupMobile, BasemapGallery,
            BasemapLayer, Basemap, Legend, InfoTemplate, Point, Extent,
            EsriQuery, QueryTask, FindTask, FindParameters, IdentifyParameters,
            Graphic, urlUtils, webMercatorUtils, dom, domConstruct, parser,
            TOC, dojoQuery) {
  
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
      }, 'standardDiv');

      this._registerWidget('layerTOC', layerTOC);
    },

    _addLegend : function (layerInfo) {
      var legendDijit;
      
      legendDijit = new Legend({
        map: this.map,
        layerInfos: layerInfo
      }, 'legendDiv');

      this._registerWidget('legendDijit', legendDijit);
    },

    _addHomeButton : function () {
      var homeButton;

      homeButton = new HomeButton({
        map: this.getMap()
      }, 'HomeButton');

      this._registerWidget('homeButton', homeButton);
    },

    _initializeMapExtent : function () {
      var map;

      map = this.getMap();

      this.initExtent = new Extent(map.extent.xmin, map.extent.ymin,
          map.extent.xmax, map.extent.ymax, map.spatialReference);

      map.enableScrollWheelZoom();
    },

    _addBookmarkWidget : function () {
      var bookmarkWidget;

      bookmarkWidget = new Bookmarks({
        map: this.getMap(),
        bookmarks: this.getBookmarks()
      }, dom.byId('featuredBookmarks'));  				

      this._registerWidget('featuredBookmarks', bookmarkWidget);
    },

    _addWidgets : function () {
      var layerInfos;

      this._addHomeButton();
      this._addScaleBar();
      this._addLocateButton();
      this._addBookmarkWidget();

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
      dojoQuery('#featuredBookmarks')
        .on('click', dojo.hitch(this, this.addGraphicSymbols));
      dojoQuery('#categoriesSelect')
        .on('change', dojo.hitch(this, this.updateSelect));
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
      this.findTask = new FindTask(this.config.map.gazeteerLayer + '/');
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
        'class': 'locate-button',
        scale: 10000,
        symbol: this.getDefaultMarkerSymbol()
      }, this.locateNode);

      this._registerWidget('locateButton', locateButton);
    },

    _createSchematicBasemap : function () {
      var vtBasemapLayer, natGeoBasemapLayer, TOBBasemapLayer;

      vtBasemapLayer = new BasemapLayer({
        url: this.basemaps.vtBasemap
      });

      natGeoBasemapLayer = new BasemapLayer({
        url: this.basemaps.basemapNG
      });

      TOBBasemapLayer = new BasemapLayer({
        url: this.basemaps.basemapTOB
      });

      return new Basemap({
        id:	'bmSchematic',
        layers: [natGeoBasemapLayer, TOBBasemapLayer, vtBasemapLayer],
        title: 'VT Campus',
        thumbnailUrl: this.basemaps.schematicThumbnail
      });
    },

    _createImageryBasemap : function () {
      var pictometryImageryBasemapLayer;

      pictometryImageryBasemapLayer = new BasemapLayer({
        url: this.basemaps.pictometry
      });

      return new Basemap({
        layers: [pictometryImageryBasemapLayer],
        id: 'bmImagery',
        title: 'Aerial Photo',
        thumbnailUrl: this.basemaps.pictometryThumbnail
      });
    },

    _addBaseMapGallery : function () {
      var schematicBasemap, imageryBasemap, basemapGallery;

      schematicBasemap = this._createSchematicBasemap();
      imageryBasemap = this._createImageryBasemap();

      basemapGallery = new BasemapGallery({
        showArcGISBasemaps: false,
        basemaps: [schematicBasemap, imageryBasemap],
        map: this.getMap()
      }, 'basemapGallery');

      basemapGallery.startup();
      basemapGallery.select('bmSchematic');
    },

    _initMap: function() {
      dojo.forEach(this.featureLayers,
          dojo.hitch(this, this.setInfoTemplates));
      this._attachEventHandlers(); 
      this._initializeIdentifyParams();
      this._addLayers();
      this._setupSearch();
      this._loadCategories();
      this._addBaseMapGallery();
    },

    /**
    * Load the Category drop down menu
    */
    _loadCategories: function () {
      var queryTask, query;

      query = new EsriQuery();
      query.returnGeometry = false;
      query.outFields = ['Category'];
      query.where = 'Category is not NULL';

      queryTask = new QueryTask(this.gazeteerLayer + '/0');
      queryTask.execute(query, this._populateList);
    },

    _populateList: function (results) {
      var category, values, isPresent, features, selectElem;

      isPresent = {};
      values = [];
      features = results.features;

      dojo.forEach(features, function(feature) {
        category = feature.attributes.CATEGORY;
        if (!isPresent[category]) {
          isPresent[category] = true;
          values.push({ name: category });
        }
      });
      
      values.sort(function(a, b) {
        return (a.name === b.name ? 0 : (a.name < b.name ? -1 : 1));
      });

      selectElem = dom.byId('categoriesSelect');

      dojo.forEach(values, function(category) {
        selectElem.options.add(new Option(category.name, category.name));
      });
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
        height  : 38,
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

    getBookmarks : function () {
      var _this, map;

      _this = this;
      map = this.getMap();

      return dojo.map(this.featuredPlaces, function(bookmarkItem){
        var point, mercatorGeometry, extent;

        point = new Point(bookmarkItem.lng, bookmarkItem.lat);
        mercatorGeometry = webMercatorUtils.geographicToWebMercator(point);
        extent = _this.pointToExtent(map, mercatorGeometry.x,
            mercatorGeometry.y, _this.searchResultExtentTolerance);

        return {
          name : bookmarkItem.name,
          extent : extent
        };
      });
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
    },

    /**
      * Update the second drop down menu with the options corresponding
      * to the category selected in the first drop down menu.
      * the options are retrieved by quering the mapservice
      * layer corresponding to the category selected.
      */
    updateSelect : function (selectedItem) {
      var name, query, queryTask, values, _this;

      _this = this;

      if (selectedItem === 'Select Category') {
        return;
      }

      name = selectedItem.target.value;

      query = new EsriQuery();  
      query.returnGeometry = false; 
      query.outFields = ['OBJECTID_12','Name'];
      query.where = "Category = '" + name + "'";
      query.orderByFields = ['Name ASC'];

      queryTask = new QueryTask(this.gazeteerLayer + '/0');
      queryTask.execute(query, function(fset) { 
        var categoryHtmlString;

        categoryHtmlString = '<div class="list-group">';

        values = dojo.map(fset.features, function(feature) {
          categoryHtmlString += dojo.replace(listItemTemplate, {
            id : feature.attributes.OBJECTID_12,
            name : feature.attributes.NAME,
            category : "",
            addr : ""
          });
        });

        categoryHtmlString += '</div>';

        dom.byId('categoryItemsList').style.display = 'block';
        dom.byId('categoryItemsList').innerHTML = categoryHtmlString;
        
        dojoQuery('.list-group-item','categoryItemsList')
          .on('click', dojo.hitch(_this, _this.zoomTo));
      });
    },

    /**
     * Adds a graphic symbol to the map at the selected featured place.
     */
    addGraphicSymbols: function (evt) {
      var placeName, selectedPlace, pt, bQueryTask, bQuery, _this;

      _this = this;

      this.hideInfoWindow();

      if (evt.target.innerText) {
        placeName = evt.target.innerText;
      } else {
        placeName = evt.target.textContent;
      }
        
      dojo.forEach(this.featuredPlaces, function(place) {
        if(place.name === placeName) {
          selectedPlace = place;
          return;
        }
      });

      pt = webMercatorUtils.geographicToWebMercator(
          new Point(selectedPlace.lng, selectedPlace.lat));

      bQuery = new EsriQuery(); 
      bQuery.outSpatialReference = { 'wkid': 102100 };
      bQuery.returnGeometry = true; 
      bQuery.outFields = [
        'BLDG_USE',
        'NAME',
        'BLDG_NUM',
        'STNUM',
        'STPREDIR',
        'STNAME',
        'STSUFFIX',
        'STPOSTDIR',
        'URL'
      ];
      bQuery.geometry = pt; 

      bQueryTask = new QueryTask(this.getLayerUrl('Buildings') + '/0');
      bQueryTask.execute(bQuery, function(fset) { 
        _this.clearGraphics();

        dojo.forEach(fset.features, function(feature) {
          feature.setSymbol(_this.getBorderSymbol()); 
          _this.addGraphics(feature); 
        });				

        _this.addGraphics(new Graphic(pt, _this.getDefaultMarkerSymbol()));
      });
    },
      
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
        geometry  : this.pointToExtent(this.map, evt.mapPoint.x,
          evt.mapPoint.y, this.pointTolerance)
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
    pointToExtent: function (map, pointX, pointY, toleranceInPixel) {
      var pixelWidth, toleraceInMapCoords;

      pixelWidth = this.getPixelWidth();
      toleraceInMapCoords = toleranceInPixel * pixelWidth;

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

    /**
    * Zooms to the location of the building selected in the search results
    */
    zoomTo : function (evt) {
      var markerSymbol, queryTask, query, _this;

      _this = this;

      markerSymbol = this.getBorderSymbol();

      this.hideInfoWindow();

      query = new EsriQuery(); 
      query.outSpatialReference = { 'wkid': 102100 }; 
      query.returnGeometry = true; 
      query.objectIds = [evt.target.id];

      queryTask = new QueryTask(this.gazeteerLayer + '/0');
      queryTask.execute(query, function(fset) { 
        _this.clearGraphics();

        dojo.forEach(fset.features, function(feature) {
          var type, shapeExtent, cntrPoint;

          type = feature.geometry.type;

          if (type === 'point') {
            markerSymbol = _this.getDefaultMarkerSymbol();
            shapeExtent = _this.pointToExtent(_this.getMap(),
                feature.geometry.x, feature.geometry.y, 80);
          } else {
            cntrPoint = feature.geometry.getExtent().getCenter();
            shapeExtent = _this.pointToExtent(_this.getMap(), cntrPoint.x,
                cntrPoint.y, 80);
          }
          
          feature.setSymbol(markerSymbol); 
          _this.map.graphics.add(feature); 
          _this.map.setExtent(shapeExtent);
        });				
      });
    },

    getSearchKeyword : function () {
      return this.findParams.searchText;
    },
    /**
    * Shows the results of searching of a building
    */
    showSearchResults: function (results) {
      var searchResults;

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

      dojo.forEach(results, function(result) {
        var attribs;

        attribs = result.feature.attributes;

        /* TODO Use dojox/dtl/Templates instead of dojo.replace
         * when the status changes from Experimental to Mature
         * see http://dojotoolkit.org/reference-guide/1.9/dojox/#website-webapp-infrastructure
         */
        searchResults += dojo.replace(listItemTemplate, {
          id: attribs.OBJECTID_12,
          name : attribs.Name,
          category : '<br>' + attribs.Category,
          addr : attribs.Address !== 'Null' ? '<br>' + attribs.Address : ''
        });
      });
    
      searchResults += '</div>';

      dom.byId('searchResults').innerHTML = searchResults;
      dom.byId('searchResults').style.display = 'block';

      dojoQuery('.list-group-item').on('click', dojo.hitch(this, this.zoomTo));
    },
  });
});
