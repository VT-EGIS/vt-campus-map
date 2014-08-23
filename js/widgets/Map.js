define([
  'dojo/_base/declare',
  'dojo/_base/array',
  "dojo/keys",
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'esri/dijit/Scalebar',
  'esri/dijit/LocateButton',
  "esri/dijit/HomeButton",
  'components/bootstrapmap/bootstrapmap',
  "dojo/promise/all",
  'dojo/text!./templates/Map.html',
  "esri/dijit/Bookmarks",
  "esri/Color",
  "esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/PictureMarkerSymbol",
  "esri/dijit/PopupMobile",
  "esri/dijit/BasemapGallery",
  "esri/dijit/BasemapLayer",
  "esri/dijit/Basemap",
  "esri/dijit/Legend",
  "esri/InfoTemplate",
  "esri/geometry/Point",
  "esri/geometry/Extent",
  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/tasks/FindTask",
  "esri/tasks/FindParameters",
  "esri/tasks/IdentifyTask",
  "esri/tasks/IdentifyParameters",
  "esri/graphic",
  "esri/urlUtils",
  "esri/geometry/webMercatorUtils",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/parser",
  "agsjs/dijit/TOC",
  "dojo/query"
], function(declare, array, keys, _WidgetBase, _TemplatedMixin,
            Scalebar, LocateButton, HomeButton,
            BootstrapMap, all, template, Bookmarks, Color, SimpleLineSymbol, 
            SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol,
            PopupMobile, BasemapGallery, BasemapLayer, Basemap, Legend,
            InfoTemplate, Point, Extent, ArcGISTiledMapServiceLayer,
            ArcGISDynamicMapServiceLayer, Query,
            QueryTask, FindTask, FindParameters, IdentifyTask,
            IdentifyParameters, Graphic, urlUtils, webMercatorUtils,
            dom, domConstruct, parser, TOC, dojoQuery) {
	var bookmarks;	
	var basemapGallery;
	var _this;
	var findTask, findParams;
	var bookmarkWidget;
  
  return declare([_WidgetBase, _TemplatedMixin], {
    constructor: function (opts) {
      this.config = opts.config;
      this.options = this.config.map.options;
      this.basemaps = this.config.map.basemaps;
      this.featureLayers = this.config.map.featureLayers;
      this.featuredPlaces = this.config.map.featuredPlaces;
      this.searchResultExtentTolerance = this.config.configs.searchResultExtentTolerance;
      this.pointTolerance = this.config.configs.pointTolerance;
      this.identifiableLayers = [];
      this.parentLayerMap = {};
      this.scaleBar = null;
      this.locateButton = null;
      this.gazeteerLayer = this.config.map.gazeteerLayer;
      this.clickedPoint = null;
      this.identifyParams = null;
      this.PictureMarker = this.config.configs.PictureMarker;

      this.defaultMarkerSymbol = new PictureMarkerSymbol({
        "angle": 0,
        "xoffset": -12,
        "yoffset": 12,
        "type": "esriPMS",
        "url": this.PictureMarker,
        "contentType": "image/png",
        "width": 24,
        "height": 24
      });

      this.fillSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255,0,0]), 2),
          new Color([255,255,0,0.5])); 

      this.options.infoWindow =
        new PopupMobile(null, domConstruct.create("div"));
    },

    templateString: template,

    _setMap: function () {
      this.map = BootstrapMap.create(this.mapNode, this.options);
    },

    postCreate: function() {
      _this = this;
      this.inherited(arguments);
      this._attachEventHandlers();
      this._setMap();
      this._load();
    },

    _attachEventHandlers: function () {
      var _this;
     
      dojoQuery('#featuredBookmarks').on('click', dojo.hitch(this, this.addGraphicSymbol));
      dojoQuery("#locateButton").on('click', dojo.hitch(this, this.locate));
      dojoQuery("#closeLink").on('click', dojo.hitch(this, this.hideGrid));
      dojoQuery("#categoriesSelect").on('change', dojo.hitch(this, this.updateSelect));

      _this = this;
      dojoQuery("input[type='text']").on("keydown", function(event) {
        if(event.keyCode === keys.ENTER) {
          event.preventDefault();
          dojoQuery('.searchResults-modal').modal('show');
          if (dojoQuery('.navbar-collapse.in', this.domNode).length > 0) {
            dojoQuery('.navbar-toggle', this.domNode)[0].click();
          }
          dom.byId("searchResults").innerHTML = "";
          dom.byId("searchResults").style.display = "none";
          _this.doFind();
        }
      });
    },
	
    _getFillSymbol: function () {
      return this._fillSymbol;
    },

    setCenter: function (center) {
      this.options.center = center;
    },

    setZoom : function (zoom) {
      this.options.zoom = zoom;
    },

    _load: function() {
      var urlObject, vtbasemap;

      urlObject = urlUtils.urlToObject(document.location.href);

      if (urlObject.query && urlObject.query.lon && urlObject.query.lat) {
        var lon = parseFloat(urlObject.query.lon);
        var lat = parseFloat(urlObject.query.lat);
        this.setCenter([lon, lat]);
        this.setZoom(7);
      }

      vtbasemap = new ArcGISTiledMapServiceLayer(this.basemaps.vtBasemap);

      // TODO Make a Map class
      // This class will then be called MapWidget
      if(vtbasemap.loaded) {
        _this._initMap();
      } else {
        vtbasemap.on('load', dojo.hitch(this, this._initMap));
      }
    },

    clearGraphics: function () {
      this.map.graphics.clear();
    },

    _addLayers: function () {
      var layers = [], _this;

      _this = this;

      dojo.forEach(this.featureLayers, function(layer, index) {
        var featureLayer, layerCount;

        featurelayer = new ArcGISDynamicMapServiceLayer(layer.url, layer);
        //TODO : Make featureLayer a class
        layer.layer = featurelayer;
        layers.push(featurelayer);
      });
      this.map.addLayers(layers);
    },

    _addTableOfContents : function (layerInfo) {
      var standardTOC;

      standardTOC = new TOC({
        map: this.getMap(),
        layerInfos: layerInfo
      }, 'standardDiv');

      standardTOC.startup();
    },

    _addLegend : function (layerInfo) {
      var legendDijit;

      legendDijit = new Legend({
        map: this.map,
        layerInfos: layerInfo
      }, "legendDiv");

      legendDijit.startup();
    },

    getMap : function () {
      return this.map;
    },

    _addHomeButton : function () {
      var homeButton;

      homeButton = new HomeButton({ map: this.getMap() }, "HomeButton");
      homeButton.startup();
    },

    _initializeMapExtent : function () {
      this.initExtent = new Extent(this.map.extent.xmin, this.map.extent.ymin,
          this.map.extent.xmax, this.map.extent.ymax, this.map.spatialReference);
      this.map.enableScrollWheelZoom();
    },

    _populateBookmarks : function () {
      var _this;

      _this = this;

      bookmarks = dojo.map(this.featuredPlaces, function(bookmarkItem, index){
        point = new Point(bookmarkItem.lng,bookmarkItem.lat);
        geom = webMercatorUtils.geographicToWebMercator(point);
        return {
          name : bookmarkItem.name,
          extent : _this.pointToExtent(_this.map, geom.x, geom.y,
                                       _this.searchResultExtentTolerance)
        }
      });

      bookmarkWidget = new Bookmarks({
        map: this.getMap(),
        bookmarks: bookmarks
      }, dom.byId("featuredBookmarks"));  				
    },

    _attachMapEventHandlers : function () {
      var _this = this;

      this.map.infoWindow.on('hide', dojo.hitch(this, this.clearGraphics));

      this.map.on('layers-add-result', function(results) {
        var layerInfo, standardTOC, legendDijit, homeBttn; 

        layerInfo = dojo.map( _this.featureLayers, function(result) {
          return {
            layer: result.layer,
            title: result.label,
            noLayers: true
          };
        });

        layerInfo = layerInfo.reverse();

        if(layerInfo.length) {
          _this._addTableOfContents(layerInfo); 
          _this._addLegend(layerInfo);
        }
        _this._initializeMapExtent();
        _this._addHomeButton();
        _this._populateBookmarks();
      });

      this.map.on("click", dojo.hitch(this, this.executeQueryTask));
    },

    _setupIdentifyParams : function () {
      this.identifyParams = new esri.tasks.IdentifyParameters();
      this.identifyParams.tolerance = 5;
      this.identifyParams.returnGeometry = true;
      this.identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
    },

    _setInfoTemplates : function () {
      var _this = this;

      this._setupIdentifyParams();

      dojo.forEach(this.featureLayers, function(layer) {
        if (layer.identifyLayers.length > 0) {
          layer.task = new esri.tasks.IdentifyTask(layer.url);

          dojo.forEach(layer.identifyLayers, function (b) {

            _this.identifiableLayers.push(b.layerName);

            _this.parentLayerMap[b.layerName] = b;

            infoTemplateHTMLString = "<table>";

            dojo.forEach(b.fields, function (c) {
              infoTemplateHTMLString = infoTemplateHTMLString + 
                "<tr><td style='vertical-align: text-top;padding-right:10px;'>" +
                c.title + "</td><td> " + c.value + "</td> </tr>";
            });

            infoTemplateHTMLString += "</table>";

            b.infoTemplate = new esri.InfoTemplate({
              title: b.title,
              content: infoTemplateHTMLString
            });
          });
        }
      });
    },

    _setupSearch : function () {
      findTask = new FindTask(_this.config.map.gazeteerLayer+"/");
      this.findParams = new FindParameters();
      this.findParams.searchFields = ["NAME"];
      this.findParams.returnGeometry = true;
      this.findParams.layerIds = [0];
      this.findParams.outSpatialReference = {"wkid":102100};
    },

    _addScaleBar : function () {
      this.scaleBar = new Scalebar({
        map: _this.map,
        scalebarUnit: 'dual'
      });
    },

    _addLocateButton : function () {
      this.locateButton = new LocateButton({
        map: _this.map,
        'class': 'locate-button',
        scale: 10000,
        symbol: new PictureMarkerSymbol(_this.config.configs.PictureMarker,32,32)
      }, this.locateNode);

      this.locateButton.startup();
    },

    _createSchematicBasemap : function () {
      var basemaps, vtBasemapLayer, natGeoBasemapLayer, TOBBasemapLayer,
          schematicBasemap;

      basemaps = [];

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
        id:	"bmSchematic",
        layers: [natGeoBasemapLayer, TOBBasemapLayer, vtBasemapLayer],
        title: "VT Campus",
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
        id: "bmImagery",
        title: "Aerial Photo",
        thumbnailUrl: _this.config.map.basemaps.pictometryThumbnail
      });
    },

    _addBaseMapGallery : function () {
      var schematicBasemap, imageryBasemap;

      schematicBasemap = this._createSchematicBasemap();
      imageryBasemap = this._createImageryBasemap();

      basemapGallery = new BasemapGallery({
        showArcGISBasemaps: false,
        basemaps: [schematicBasemap, imageryBasemap],
        map: this.getMap()
      }, "basemapGallery");

      basemapGallery.startup();
      basemapGallery.select("bmSchematic");
    },

    _initMap: function() {
      this._attachMapEventHandlers(); 
      this._addLayers();
      this._setInfoTemplates();
      this._setupSearch();
      this._loadCategories();
      this._addScaleBar();
      this._addLocateButton();
      this._addBaseMapGallery();
    },

    /**
     * Gets the URL of the layer given the layer name.
     * The function looks up the layername in the feature layers array.
     */
    getLayerUrl : function (layerName) {	
      var numFeatureLayers;

      numFeatureLayers = this.featureLayers.length;

      for (i = 0; i < numFeatureLayers; i++) {
        if (this.featureLayers[i].label === layerName) {
          return this.featureLayers[i].url;
        }
      }
    },
    /**
      * Update the second drop down menu with the options corresponding
      * to the category selected in the first drop down menu.
      * the options are retrieved by quering the mapservice layer corresponding to the category selected.
      */
    updateSelect : function (selectedItem) {
      var layerUrl, name, query, dataItems, queryTask, values, attr, _this;

      _this = this;
      if (selectedItem === "Select Category") {
        return;
      }

      layerUrl = this.gazeteerLayer + "/0";

      name = selectedItem.target.value;

      query = new Query();  
      query.returnGeometry = false; 
      query.outFields = ["OBJECTID_12","Name"];
      query.where = "Category = '" + name +"'";
      query.orderByFields = ["Name ASC"];

      queryTask = new QueryTask(layerUrl);
      queryTask.execute(query, function(fset) { 
        var s;

        values = dojo.map(fset.features, function(feature) {
          attr = feature.attributes; 
          return {
            objectid: attr.OBJECTID_12,
            name: attr.NAME
          };				 				  
        });
      
        s = ["<div class='list-group'>"];

        dojo.forEach(values, function(result) {
          var param;

          param = result.objectid;
          s.push("<a href='#' class='list-group-item' " +
                 "data-dismiss='modal' id='" + param+"'>" + result.name + "</a>");
        });

        s.push("</div");
        dom.byId("categoryItemsList").style.display = "block";
        dom.byId("categoryItemsList").innerHTML = s.join("");
        
        dojoQuery(".list-group-item","categoryItemsList")
          .on('click', dojo.hitch(_this, _this.zoomTo));
      });
    },
    /**
     * Adds a graphic symbol to the map at the position corresponding to the
     * featured place selected.
     */
    _addGraphics : function (graphic) {
      this.map.graphics.add(graphic);
    },

    addGraphicSymbol: function (evt) {
      var placeName, selectedPlace, pt, layerUrl, bQueryTask, bQuery, _this;

      _this = this;

      this.map.infoWindow.hide();

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

      layerUrl = this.getLayerUrl("Buildings");

      bQueryTask = new QueryTask(layerUrl + "/0");

      bQuery = new Query(); 
      bQuery.outSpatialReference = { "wkid": 102100 };
      bQuery.returnGeometry = true; 
      bQuery.outFields = [
        "BLDG_USE",
        "NAME",
        "BLDG_NUM",
        "STNUM",
        "STPREDIR",
        "STNAME",
        "STSUFFIX",
        "STPOSTDIR",
        "URL"
      ];
      bQuery.geometry = pt; 
      bQueryTask.execute(bQuery, function(fset) { 
        _this.clearGraphics();

        if(fset.features.length < 1) {
          _this._addGraphics(new Graphic(pt, _this.defaultMarkerSymbol));
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
      query.outFields = ["Category"];
      query.where = "Category is not NULL";

      queryTask = new QueryTask(_this.config.map.gazeteerLayer + "/0");
      queryTask.execute(query,_this.populateList);
    },

    populateList: function (results) {
      var category, values, testVals, features;

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
      selectElem = dom.byId("categoriesSelect");

      dojo.forEach(values, function(cat, index) {
        selectElem.options.add(new Option(cat.name, cat.name));
      });
    },
      
    showInfo: function (results) {
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
        this.map.infoWindow.show(this.clickedPoint);
        this.map.infoWindow.setFeatures(features);
        this.map.infoWindow.show(this.clickedPoint);
      }
    },
      
    executeQueryTask : function (evt) { 
      var tasks, _this, deferreds;

      _this = this;
      this.map.infoWindow.hide(); 
      this.map.infoWindow.clearFeatures();
      this.clearGraphics(); 
      this.clickedPoint = evt.mapPoint;
      this.identifyParams.geometry = this.pointToExtent(this.map, evt.mapPoint.x,
          evt.mapPoint.y, this.pointTolerance);
      this.identifyParams.mapExtent = this.map.extent;
      this.identifyParams.width  = this.map.width;
      this.identifyParams.height = this.map.height;	  		

      tasks = [];
      dojo.map(this.featureLayers, function (layer) {
        if (layer.identifyLayers.length > 0 && layer.layer.visibleAtMapScale) {
          tasks.push(layer.task);
        }
      });
      
      deferreds = dojo.map(tasks, function(task) {
        return task.execute(_this.identifyParams);
      });
      promises = new all(deferreds);
      promises.then(dojo.hitch(this, this.showInfo));
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
    * hide the search results when the user clicks on the x button
    */
    hideGrid: function () {
      dom.byId("searchResults").innerHTML = "";
      dom.byId("searchText").value = "";
      dom.byId("searchResultsDiv").style.display = "none";
      _this.map.centerAndZoom(center,zoom);
      _this.map.graphics.clear();
    },

    /**
    * searches for a building using the building name given by the user
    */
    doFind : function () {
      dom.byId("searchResults").innerHTML = "";
      dom.byId("searchResultsDiv").style.display = "block";
      this.findParams.searchText = dom.byId('searchField').value;
      findTask.execute(this.findParams, dojo.hitch(this, this.showResults));
      searchField = dojoQuery('#searchField')[0];
      searchField.value = "";
    },

    /**
    * Zooms to the location of the building selected in the search results
    */
    zoomTo : function (item) {
      var clickedAssetId, markerSymbol, layer, queryTask, query, _this;

      _this = this;
      clickedAssetId = item.target.id;
      markerSymbol = this._getFillSymbol();
      layer = this.gazeteerLayer + "/0";

      this.map.infoWindow.hide();

      query = new Query(); 
      query.outSpatialReference = {"wkid":102100}; 
      query.returnGeometry = true; 
      query.objectIds = [clickedAssetId]; 

      queryTask = new QueryTask(layer);

      queryTask.execute(query, function(fset) { 
        _this.clearGraphics(); 

        dojo.forEach(fset.features, function(feature) {
          var type, shapeExtent, cntrPoint;

          type = feature.geometry.type;
          if (type === "point") {
            markerSymbol = _this.defaultMarkerSymbol;
            shapeExtent = _this.pointToExtent(_this.getMap(),
                feature.geometry.x, feature.geometry.y, 80);
          } else {
            shapeExtent = feature.geometry.getExtent();
            cntrPoint = shapeExtent.getCenter();
            shapeExtent = _this.pointToExtent(_this.getMap(), cntrPoint.x,
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
      s = "XMin: "+ extent.xmin + "&nbsp;" +
          "YMin: " + extent.ymin + "&nbsp;" +
          "XMax: " + extent.xmax + "&nbsp;" +
          "YMax: " + extent.ymax + "&nbsp;" + extent.spatialReference.wkid;
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

      this.clearGraphics();
      s = ["<div class='list-group'>"];
      this.sortResults(results);

      dojo.forEach(results, function(result) {
        var graphic, addr, param;

        graphic = result.feature;         
        attribs = result.feature.attributes;
        addr = (attribs.Address.toLowerCase() !== "null") ? "<br/>" +attribs.Address : "";
        param = attribs.OBJECTID_12 ;//+ "," + " \""+layerUrl +"\"";
        s.push("<a href='#' class='list-group-item' " +
               "data-dismiss='modal' id='" + param + "'>" +
               attribs.Name + "<br/>" + attribs.Category + addr + "</a>");
      });
    
      s.push("</div");
      dom.byId("searchResults").innerHTML = s.join("");
      dom.byId("searchResults").style.display = "block";
      dojoQuery(".list-group-item").on('click', dojo.hitch(this, this.zoomTo));
    },
  });
});
