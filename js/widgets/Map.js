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
  'esri/layers/ArcGISTiledMapServiceLayer',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/tasks/FindTask',
  'esri/tasks/FindParameters',
  'esri/tasks/IdentifyTask',
  'esri/tasks/IdentifyParameters',
  'esri/graphic',
  'esri/urlUtils',
  'esri/geometry/webMercatorUtils',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/parser',
  'agsjs/dijit/TOC',
  'dojo/query',
  'dojo',
  'esri'
], function(declare, array, keys, _WidgetBase, _TemplatedMixin,
            Scalebar, LocateButton, HomeButton,
            BootstrapMap, all, template, Bookmarks, Color, SimpleLineSymbol, 
            SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol,
            PopupMobile, BasemapGallery, BasemapLayer, Basemap, Legend,
            InfoTemplate, Point, Extent, ArcGISTiledMapServiceLayer,
            ArcGISDynamicMapServiceLayer, Query,
            QueryTask, FindTask, FindParameters, IdentifyTask,
            IdentifyParameters, Graphic, urlUtils, webMercatorUtils,
            dom, domConstruct, parser, TOC, dojoQuery, dojo, esri) {
  
  return declare([_WidgetBase, _TemplatedMixin], {
    constructor: function (opts) {
      var config, _this;

      config = opts.config;
      _this = this;

      dojo.forEach([config.map, config.configs],
          dojo.hitch(this, this._copyProperties));

      this._setDefaultMarkerSymbol();
      this._setFillSymbol();
      this._setInfoWindow();
      this._setPictureMarkerSymbol();

      this.identifiableLayers = [];
      this.parentLayerMap = {};
    },

    _copyProperties : function (configItem) {
      for(var property in configItem) {
        if(configItem.hasOwnProperty(property)) {
          this[property] = configItem[property];
        }
      }
    },

    templateString: template,

    postCreate: function() {
      var urlObject;
      this.inherited(arguments);
      this._attachEventHandlers();
      this._setMap();

      urlObject = urlUtils.urlToObject(document.location.href);

      if (urlObject.query && urlObject.query.lon && urlObject.query.lat) {
        var lon = parseFloat(urlObject.query.lon);
        var lat = parseFloat(urlObject.query.lat);
        this._setOption('center', [lon, lat]);
        this._setOption('zoom', 7);
      }

      this._initMap();
    },

    _setMap: function () {
      this.map = BootstrapMap.create(this.mapNode, this.options);
    },

    _getMap : function () {
      return this.map;
    },

    _setInfoWindow : function () {
      var element;

      element = domConstruct.create('div');
      this.options.infoWindow = new PopupMobile(null, element);
    },

    _setDefaultMarkerSymbol : function () {
      this.defaultMarkerSymbol = new PictureMarkerSymbol({
        'angle': 0,
        'xoffset': -12,
        'yoffset': 12,
        'type': 'esriPMS',
        'url': this.PictureMarker,
        'contentType': 'image/png',
        'width': 24,
        'height': 24
      });
    },

    _getDefaultMarkerSymbol : function () {
      return this.defaultMarkerSymbol;
    },

    _setFillSymbol : function () {
      var line, red, brown;

      red = new Color([255, 0, 0]);
      brown = new Color([255, 255, 0, 0.5]); 
      line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, red, 2);
      this.fillSymbol =
        new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, line, brown);
    },

    _getFillSymbol: function () {
      return this._fillSymbol;
    },

    _setPictureMarkerSymbol : function () {
      this.pictureMarkerSymbol =
        new PictureMarkerSymbol(this.PictureMarker, 32, 32);
    },

    _getPictureMarkerSymbol : function () {
      return this.pictureMarkerSymbol;
    },

    _attachEventHandlers: function () {
      dojoQuery('#locateButton', this.domNode)
        .on('click', dojo.hitch(this, this.locate));
      dojoQuery('#searchField', this.domNode)
        .on('keydown', dojo.hitch(this, this.doFind));
      // The events of the NavigationBar are handled here
      // because the handlers need to modify the Map
      dojoQuery('#featuredBookmarks')
        .on('click', dojo.hitch(this, this.addGraphicSymbol));
      dojoQuery('#categoriesSelect')
        .on('change', dojo.hitch(this, this.updateSelect));
    },
	
    _setOption: function (key, value) {
      this.options[key] = value;
    },

    _clearGraphics: function () {
      this.map.graphics.clear();
    },

    _addGraphics : function (graphic) {
      this.map.graphics.add(graphic);
    },

    _addLayers: function () {
      var layers = [], _this;

      _this = this;

      dojo.forEach(this.featureLayers, function(layer) {
        var featurelayer;

        featurelayer = new ArcGISDynamicMapServiceLayer(layer.url, layer);
        //TODO : Make featureLayer a class
        layer.layer = featurelayer;
        layers.push(featurelayer);
      });
      this.map.addLayers(layers);
    },

    _addLayerTableOfContents : function (layerInfo) {
      this.layerTOC = new TOC({
        map: this._getMap(),
        layerInfos: layerInfo
      }, 'standardDiv');

      this.layerTOC.startup();
    },

    _addLegend : function (layerInfo) {
      this.legendDijit = new Legend({
        map: this.map,
        layerInfos: layerInfo
      }, 'legendDiv');

      this.legendDijit.startup();
    },

    _addHomeButton : function () {
      this.homeButton = new HomeButton({
        map: this._getMap()
      }, 'HomeButton');

      this.homeButton.startup();
    },

    _initializeMapExtent : function () {
      var map;

      map = this._getMap();

      this.initExtent = new Extent(map.extent.xmin, map.extent.ymin,
          map.extent.xmax, map.extent.ymax, map.spatialReference);

      map.enableScrollWheelZoom();
    },

    _addBookmarkWidget : function () {
      this.bookmarkWidget = new Bookmarks({
        map: this._getMap(),
        bookmarks: this._getBookmarks()
      }, dom.byId('featuredBookmarks'));  				
    },

    _getBookmarks : function () {
      var _this, map;

      _this = this;
      map = this._getMap();

      return dojo.map(this.featuredPlaces, function(bookmarkItem){
        var point, geom, extent;

        point = new Point(bookmarkItem.lng, bookmarkItem.lat);
        geom = webMercatorUtils.geographicToWebMercator(point);
        extent = _this.pointToExtent(map, geom.x, geom.y,
           _this.searchResultExtentTolerance);

        return {
          name : bookmarkItem.name,
          extent : extent
        };
      });
    },

    _getLayerInfos : function () {
      return dojo.map(this.featureLayers, function(result) {
        return {
          layer: result.layer,
          title: result.label,
          noLayers: true
        };
      }).reverse();
    },

    _addWidgets : function () {
      var layerInfos;

      this._addHomeButton();
      this._addScaleBar();
      this._addLocateButton();
      this._addBookmarkWidget();

      layerInfos = this._getLayerInfos();

      this._addLayerTableOfContents(layerInfos); 
      this._addLegend(layerInfos);
    },

    _attachMapEventHandlers : function () {
      this.map.infoWindow.on('hide', dojo.hitch(this, this._clearGraphics));
      this.map.on('layers-add-result',
          dojo.hitch(this, this._initializeMapExtent));
      this.map.on('layers-add-result',
          dojo.hitch(this, this._initializeIdentifyParams));
      this.map.on('layers-add-result', dojo.hitch(this, this._addWidgets));
      this.map.on('click', dojo.hitch(this, this.executeQueryTask));
    },

    _initializeIdentifyParams : function () {
      var map;

      map = this._getMap();

      this.identifyParams = new esri.tasks.IdentifyParameters();
      this.identifyParams.tolerance = 5;
      this.identifyParams.returnGeometry = true;
      this.identifyParams.layerOption =
        esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
      this.identifyParams.mapExtent = map.extent;
      this.identifyParams.width  = map.width;
      this.identifyParams.height = map.height;	  		
    },

    _getIdentifyParams : function () {
      return this.identifyParams;
    },

    _setInfoTemplates : function (layer) {
      var _this, infoTemplateHTMLString;

      _this = this;

      if (layer.identifyLayers.length > 0) {
        layer.task = new esri.tasks.IdentifyTask(layer.url);

        dojo.forEach(layer.identifyLayers, function (b) {

          _this.identifiableLayers.push(b.layerName);

          _this.parentLayerMap[b.layerName] = b;

          infoTemplateHTMLString = '<table>';

          dojo.forEach(b.fields, function (c) {
            infoTemplateHTMLString = infoTemplateHTMLString + 
              '<tr><td style="vertical-align: text-top;padding-right:10px;">' +
              c.title + '</td><td> ' + c.value + '</td> </tr>';
          });

          infoTemplateHTMLString += '</table>';

          b.infoTemplate = new esri.InfoTemplate({
            title: b.title,
            content: infoTemplateHTMLString
          });
        });
      }
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
      this.scaleBar = new Scalebar({
        map: this._getMap(),
        scalebarUnit: 'dual'
      });
    },

    _addLocateButton : function () {
      this.locateButton = new LocateButton({
        map: this._getMap(),
        'class': 'locate-button',
        scale: 10000,
        symbol: this._getPictureMarkerSymbol()
      }, this.locateNode);

      this.locateButton.startup();
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
        map: this._getMap()
      }, 'basemapGallery');

      basemapGallery.startup();
      basemapGallery.select('bmSchematic');
    },

    _initMap: function() {
      dojo.forEach(this.featureLayers,
          dojo.hitch(this, this._setInfoTemplates));
      this._attachMapEventHandlers(); 
      this._addLayers();
      this._setupSearch();
      this._loadCategories();
      this._addBaseMapGallery();
    },

    /**
     * Gets the URL of the layer given the layer name.
     * The function looks up the layername in the feature layers array.
     */
    _getLayerUrl : function (layerName) {	
      var numFeatureLayers;

      numFeatureLayers = this.featureLayers.length;

      for (var i = 0; i < numFeatureLayers; i++) {
        if (this.featureLayers[i].label === layerName) {
          return this.featureLayers[i].url;
        }
      }
    },
    /**
      * Update the second drop down menu with the options corresponding
      * to the category selected in the first drop down menu.
      * the options are retrieved by quering the mapservice
      * layer corresponding to the category selected.
      */
    updateSelect : function (selectedItem) {
      var layerUrl, name, query, queryTask, values, _this;

      _this = this;
      if (selectedItem === 'Select Category') {
        return;
      }

      layerUrl = this.gazeteerLayer + '/0';

      name = selectedItem.target.value;

      query = new Query();  
      query.returnGeometry = false; 
      query.outFields = ['OBJECTID_12','Name'];
      query.where = "Category = '" + name + "'";
      query.orderByFields = ['Name ASC'];

      queryTask = new QueryTask(layerUrl);
      queryTask.execute(query, function(fset) { 
        var s, attr;

        values = dojo.map(fset.features, function(feature) {
          attr = feature.attributes; 
          return {
            objectid: attr.OBJECTID_12,
            name: attr.NAME
          };				 				  
        });
      
        s = ['<div class="list-group">'];

        dojo.forEach(values, function(result) {
          var param;

          param = result.objectid;
          s.push('<a href="#" class="list-group-item" ' +
                 'data-dismiss="modal" id="' + param +
                 '">' + result.name + '</a>');
        });

        s.push('</div');
        dom.byId('categoryItemsList').style.display = 'block';
        dom.byId('categoryItemsList').innerHTML = s.join('');
        
        dojoQuery('.list-group-item','categoryItemsList')
          .on('click', dojo.hitch(_this, _this.zoomTo));
      });
    },

    _setInfoWindowFeatures : function (features) {
        this.map.infoWindow.setFeatures(features);
    },

    _showInfoWindow : function (point) {
      this.map.infoWindow.show(point);
    },

    _hideInfoWindow : function () {
      this.map.infoWindow.hide();
    },

    _clearInfoWindow : function () {
      this.map.infoWindow.clearFeatures();
    },
    /**
     * Adds a graphic symbol to the map at the position corresponding to the
     * featured place selected.
     */
    addGraphicSymbol: function (evt) {
      var placeName, selectedPlace, pt, layerUrl, bQueryTask, bQuery, _this;

      _this = this;

      this._hideInfoWindow();

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

      layerUrl = this._getLayerUrl('Buildings');

      bQueryTask = new QueryTask(layerUrl + '/0');

      bQuery = new Query(); 
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
      bQueryTask.execute(bQuery, function(fset) { 
        _this._clearGraphics();

        if(fset.features.length < 1) {
          _this._addGraphics(new Graphic(pt, _this.getDefaultMarkerSymbol()));
        }

        dojo.forEach(fset.features,function(feature) {
          feature.setSymbol(_this._getFillSymbol()); 
          _this._addGraphics(feature); 
        });				
      });
    },
    /**
    * Load the Category drop down menu
    */
    _loadCategories: function () {
      var queryTask, query;

      query = new Query();
      query.returnGeometry = false;
      query.outFields = ['Category'];
      query.where = 'Category is not NULL';

      queryTask = new QueryTask(this.gazeteerLayer + '/0');
      queryTask.execute(query, this.populateList);
    },

    populateList: function (results) {
      var category, values, testVals, features, selectElem;

      testVals = {};
      values = [];
      features = results.features;
      dojo.forEach(features, function(feature) {
        category = feature.attributes.CATEGORY;
        if (!testVals[category]) {
          testVals[category] = true;
          values.push({ name: category });
        }
      });
      
      values.sort(this.sortResults);      
      selectElem = dom.byId('categoriesSelect');

      dojo.forEach(values, function(cat) {
        selectElem.options.add(new Option(cat.name, cat.name));
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
          feature.setSymbol(_this._getFillSymbol());
          feature.attributes.layerName = layerName;

          if (dojo.indexOf(_this.identifiableLayers,layerName) !== -1) {
            mapLayerObject = _this.parentLayerMap[layerName];
            feature.setInfoTemplate(mapLayerObject.infoTemplate);
            features.push(feature);
          }	
        });
      });

      if (features.length > 0) {
        this._setInfoWindowFeatures(features);
        this._showInfoWindow(clickedPoint);
      }
    },
      
    _setIdentifyParams : function (opts) {
      for(var key in opts) {
        if(opts.hasOwnProperty(key)) {
          this.identifyParams[key] = opts[key];
        }
      }
    },

    executeQueryTask : function (evt) { 
      var tasks, _this, deferreds, map, promises;

      _this = this;
      map = this._getMap();

      this._hideInfoWindow();
      this._clearInfoWindow();
      this._clearGraphics(); 

      this._setIdentifyParams({
        mapExtent : map.extent,
        geometry  : this.pointToExtent(this.map, evt.mapPoint.x,
          evt.mapPoint.y, this.pointTolerance)
      });

      tasks = [];
      dojo.map(this.featureLayers, function (layer) {
        if (layer.identifyLayers.length > 0 && layer.layer.visibleAtMapScale) {
          tasks.push(layer.task);
        }
      });
      
      deferreds = dojo.map(tasks, function(task) {
        return task.execute(_this._getIdentifyParams());
      });
      promises = new all(deferreds);
      promises.then(dojo.hitch(this, function(results) {
        this.showInfo(results, evt.mapPoint);
      }));
    },
    _getPixelWidth : function () {
      return this.initExtent.getWidth() / this.map.width;
    },
    /**
    * a utility function that converts a point coordinates to a map extent
    */
    pointToExtent: function (map, pointX, pointY, toleranceInPixel) {
      var pixelWidth, toleraceInMapCoords;

      pixelWidth = this._getPixelWidth();
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

      dojoQuery('.searchResults-modal').modal('show');
      if (dojoQuery('.navbar-collapse.in', this.domNode).length > 0) {
        dojoQuery('.navbar-toggle', this.domNode)[0].click();
      }
      dom.byId('searchResults').innerHTML = '';
      dom.byId('searchResults').style.display = 'none';
      dom.byId('searchResults').innerHTML = '';
      dom.byId('searchResultsDiv').style.display = 'block';
      this.findParams.searchText = dom.byId('searchField').value;
      this.findTask.execute(this.findParams,
          dojo.hitch(this, this.showResults));
      searchField = dojoQuery('#searchField')[0];
      searchField.value = '';
    },

    /**
    * Zooms to the location of the building selected in the search results
    */
    zoomTo : function (item) {
      var clickedAssetId, markerSymbol, layer, queryTask, query, _this;

      _this = this;
      clickedAssetId = item.target.id;
      markerSymbol = this._getFillSymbol();
      layer = this.gazeteerLayer + '/0';

      this._hideInfoWindow();

      query = new Query(); 
      query.outSpatialReference = {'wkid':102100}; 
      query.returnGeometry = true; 
      query.objectIds = [clickedAssetId]; 

      queryTask = new QueryTask(layer);

      queryTask.execute(query, function(fset) { 
        _this._clearGraphics(); 

        dojo.forEach(fset.features, function(feature) {
          var type, shapeExtent, cntrPoint;

          type = feature.geometry.type;
          if (type === 'point') {
            markerSymbol = _this._getDefaultMarkerSymbol();
            shapeExtent = _this.pointToExtent(_this._getMap(),
                feature.geometry.x, feature.geometry.y, 80);
          } else {
            shapeExtent = feature.geometry.getExtent();
            cntrPoint = shapeExtent.getCenter();
            shapeExtent = _this.pointToExtent(_this._getMap(), cntrPoint.x,
                cntrPoint.y, 80);
          }
          
          feature.setSymbol(markerSymbol); 
          _this.map.graphics.add(feature); 
          _this.map.setExtent(shapeExtent);
        });				
      });
    },

    showExtent:function (extent) {
      var s;
      s = 'XMin: '+ extent.xmin + '&nbsp;' +
          'YMin: ' + extent.ymin + '&nbsp;' +
          'XMax: ' + extent.xmax + '&nbsp;' +
          'YMax: ' + extent.ymax + '&nbsp;' + extent.spatialReference.wkid;
      alert(s);
    },

    sortResults: function (results) {
      results.sort(function(a, b) {
         var nameA = a.feature.attributes.Name.toLowerCase();
         var nameB = b.feature.attributes.Name.toLowerCase();
         var result = 0;
         //sort string ascending
         if (nameA < nameB) {
          result =  -1;
         } else if (nameA > nameB) {
          result =  1;
         }
         return result;
      });
    },

    /**
    * Shows the results of searching of a building
    */
    showResults: function (results) {
      var attribs, s;

      this._clearGraphics();
      s = ['<div class="list-group">'];
      this.sortResults(results);

      dojo.forEach(results, function(result) {
        var graphic, addr, param;

        graphic = result.feature;         
        attribs = result.feature.attributes;
        addr = (attribs.Address.toLowerCase() !== 'null') ? '<br/>' + attribs.Address : '';
        param = attribs.OBJECTID_12 ;
        s.push('<a href="#" class="list-group-item" ' +
               'data-dismiss="modal" id="' + param + '">' +
               attribs.Name + '<br/>' + attribs.Category + addr + '</a>');
      });
    
      s.push('</div');
      dom.byId('searchResults').innerHTML = s.join('');
      dom.byId('searchResults').style.display = 'block';
      dojoQuery('.list-group-item').on('click', dojo.hitch(this, this.zoomTo));
    },
  });
});
