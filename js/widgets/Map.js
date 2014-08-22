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
	parser.parse();
	var vtbasemap;
	var initExtent;
	var clickedPoint;
	var bookmarks;	
	var basemapGallery;
	var thisObject;
	var findTask, findParams;
	var symbol;
	var fillSymbol;
	var layers=[];
	var layerCount = 0;
	var bookmarkWidget;
	var defaultMarkerSymbol;
	var identifyParams;
	var identifiableLayers = [];
	var parentLayerMap = {};
  
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function() {
      thisObject = this;
      this.inherited(arguments);
      this.loadConfigs();
      this._attachEventHandlers();
    },

    _attachEventHandlers: function () {
      dojoQuery("#featuredBookmarks").on('click', this.addGraphicSymbol);
      dojoQuery("#imgFrame").on('click', this.addGraphicSymbol);
      dojoQuery("#locateButton").on('click', this.locate);
      dojoQuery("#closeLink").on('click', this.hideGrid);
    },
	
    loadConfig: function() {
      vtbasemap = new ArcGISTiledMapServiceLayer(this.config.map.basemaps.vtBasemap);
      categoriesContent = dom.byId("categoriesContent");
      categoriesContent.innerHTML = "<select id='categoriesSelect' " +
        "name='categoriesSelect' class='form-control' >" +
        "<option selected>Select Category</option></select>" +
        "<div class='itemsList' id='categoryItemsList'></div>";
      //Ashima : I'm here
      dojoQuery("#categoriesSelect").on('change', this.updateSelect);
      dojoQuery("input[type='text']").on("keydown", function(event) {
        if(event.keyCode === keys.ENTER) {
          event.preventDefault();
          dojoQuery('.searchResults-modal').modal('show');
          if (dojoQuery('.navbar-collapse.in', this.domNode).length > 0) {
            dojoQuery('.navbar-toggle', this.domNode)[0].click();
          }
          dom.byId("searchResults").innerHTML = "";
          dom.byId("searchResults").style.display = "none";
          thisObject.doFind();
        }
      });
      
      var urlObject = urlUtils.urlToObject(document.location.href);
      if (urlObject.query && urlObject.query.lon && urlObject.query.lat) {
        var lon = parseFloat(urlObject.query.lon);
        var lat = parseFloat(urlObject.query.lat);
        this.map.options.center = [lon, lat];
        this.map.options.zoom = 7;
      }

      symbol = new SimpleMarkerSymbol(
          SimpleFillSymbol.STYLE_SOLID, 8,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([0,255,197]), 1),
          new Color([0,255,197, 1.00]));

      fillSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255,0,0]), 2),
          new Color([255,255,0,0.5])); 

      this.config.map.options.infoWindow =
        new PopupMobile(null, domConstruct.create("div"));

      this.map = BootstrapMap.create(this.mapNode, this.config.map.options);

      if(vtbasemap.loaded) {
        this._initMap();
      } 
      else {
        vtbasemap.on('load',dojo.hitch(thisObject,this._initMap));
      }
    },

    formatContent : function(key,value,data) {
      return value.replace("Null","");
    },

    _initMap: function() {
      dojo.forEach(this.config.map.featureLayers, function(layer, index) {
        var featurelayer = new ArcGISDynamicMapServiceLayer(
                            layer.layerURL,
                            {
                              "opacity":layer.opacity,
                              "visible":layer.visible
                            });
        layer.layer = featurelayer;
        layers.push(featurelayer);
        layerCount++;	
        if(layerCount === thisObject.config.map.featureLayers.length) {
          thisObject.map.addLayers(layers);
        }
      });

      this.map.infoWindow.on('hide',function() {
        thisObject.map.graphics.clear();
      });
      
      this.map.on('layers-add-result',function(results) {
        var layerInfo = dojo.map(
            thisObject.config.map.featureLayers,
            function(result) {
              return {
                layer:result.layer,
                title:result.label,
                noLayers:true
              };
            });

        layerInfo = layerInfo.reverse();

        var standardTOC = new TOC({
          map: thisObject.map,
          layerInfos:layerInfo
        }, 'standardDiv');

        standardTOC.startup();
      
        if(layerInfo.length) {
          var legendDijit = new Legend({
            map:thisObject.map,
            layerInfos:layerInfo
          }, "legendDiv");
          legendDijit.startup();
        }		
      
        initExtent = new Extent(thisObject.map.extent.xmin,
            thisObject.map.extent.ymin,
            thisObject.map.extent.xmax,
            thisObject.map.extent.ymax,
            thisObject.map.spatialReference);
        thisObject.map.enableScrollWheelZoom();

        var homeBttn = new HomeButton({ map: thisObject.map }, "HomeButton");
        homeBttn.startup();
    
        var bookmarksExtent = [];
        for (var i = 0; i < thisObject.config.map.featuredPlaces.length; i++) {
          var bookmarkItem = thisObject.config.map.featuredPlaces[i];
          var bookmarktItemExtent = {};
          bookmarktItemExtent.name = bookmarkItem.name;
          var geom = webMercatorUtils.geographicToWebMercator(
              new Point(bookmarkItem.lng,bookmarkItem.lat));
          bookmarktItemExtent.extent = thisObject.pointToExtent(
              thisObject.map,
              geom.x,
              geom.y,
              thisObject.config.configs.searchResultExtentTolerance);
          bookmarksExtent.push(bookmarktItemExtent);
        }
        bookmarks = bookmarksExtent;
        bookmarkWidget = new Bookmarks({
          map: thisObject.map,
          bookmarks:bookmarks
        }, dom.byId("featuredBookmarks"));  				
      });
        
      this.map.on("click", this.executeQueryTask);
      
      identifyParams = new esri.tasks.IdentifyParameters();
      identifyParams.tolerance = 5;
      identifyParams.returnGeometry = true;
      identifyParams.layerOption =
        esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
      
      dojo.forEach(this.config.map.featureLayers, function(layer) {
        if (layer.identifyLayers.length > 0) {
          layer.task = new esri.tasks.IdentifyTask(layer.layerURL);
          dojo.forEach(layer.identifyLayers, function (b) {
            identifiableLayers.push(b.layerName);
            parentLayerMap[b.layerName]= b;
            infoTemplateHTMLString = "<table>";
            dojo.forEach(b.fields, function (c) {
              infoTemplateHTMLString = infoTemplateHTMLString + 
                "<tr><td style='vertical-align: text-top;padding-right:10px;'>" +
                c.title + "</td><td> " + c.value + "</td> </tr>";
            });
            infoTemplateHTMLString += "</table>";
            b.infoTemplate = new esri.InfoTemplate({
              title:b.title,
              content:infoTemplateHTMLString
            });
          });
        }
      });
    
      findTask = new FindTask(this.config.map.gazeteerLayer+"/");
      findParams = new FindParameters();
      findParams.searchFields = ["NAME"];
      findParams.returnGeometry = true;
      findParams.layerIds = [0];
      findParams.outSpatialReference = {"wkid":102100};

      this.loadCategories();
      
      defaultMarkerSymbol = new PictureMarkerSymbol({
        "angle":0,
        "xoffset":-12,
        "yoffset":12,
        "type":"esriPMS",
        "url":this.config.configs.PictureMarker,
        "contentType":"image/png",
        "width":24,
        "height":24
      });

      this.scalebar = new Scalebar({
        map: this.map,
        scalebarUnit: 'dual'
      });
      this.geoLocate = new LocateButton({
        map: this.map,
        'class': 'locate-button',
        scale:10000,
        symbol:new PictureMarkerSymbol(this.config.configs.PictureMarker,32,32)
      }, this.locateNode);
      this.geoLocate.startup();
        
      var basemaps = [];
      var vtBasemapLayer = new BasemapLayer({
        url: thisObject.config.map.basemaps.vtBasemap
      });
      var natGeoBasemapLayer = new BasemapLayer({
        url: thisObject.config.map.basemaps.basemapNG
      });
      var TOBBasemapLayer = new BasemapLayer({
        url: thisObject.config.map.basemaps.basemapTOB
      });
      var schematicBasemap = new Basemap({
        id:	"bmSchematic",
        layers: [natGeoBasemapLayer,TOBBasemapLayer,vtBasemapLayer],
        title: "VT Campus",
        thumbnailUrl: thisObject.config.map.basemaps.schematicThumbnail
      });
      basemaps.push(schematicBasemap);
      var pictometryImageryBasemapLayer = new BasemapLayer({
        url: thisObject.config.map.basemaps.pictometry
      });
      var basemapImagery = new Basemap({
        layers: [pictometryImageryBasemapLayer],
        id: "bmImagery",
        title: "Aerial Photo",
        thumbnailUrl:thisObject.config.map.basemaps.pictometryThumbnail
      });
      basemaps.push(basemapImagery);        
      basemapGallery = new BasemapGallery({
        showArcGISBasemaps: false,
        basemaps: basemaps,
        map: thisObject.map
      }, "basemapGallery");
      basemapGallery.startup();
      basemapGallery.select("bmSchematic");
    },

    /**
     * Gets the URL of the layer given the layer name.
     * The function looks up the layername in the feature layers array.
     */
    getLayerUrl : function (layerName) {	
      for (i = 0; i< this.config.map.featureLayers.length; i++) {
        if (this.config.map.featureLayers[i].label === layerName) {
          return this.config.map.featureLayers[i].layerURL;
        }
      }
    },
    /**
      * Update the second drop down menu with the options corresponding
      * to the category selected in the first drop down menu.
      * the options are retrieved by quering the mapservice layer corresponding to the category selected.
      */
    updateSelect : function (selectedItem) {
      var layerUrl = thisObject.config.map.gazeteerLayer + "/0";
      if (selectedItem === "Select Category") {
        return;
      }
      var name = selectedItem.target.value;
      var query = new Query();  
      query.returnGeometry = false; 
      query.outFields = ["OBJECTID_12","Name"];
      query.where = "Category = '" + name +"'";
      query.orderByFields = ["Name ASC"];
        
      var dataItems ,values = [], attr;
      var queryTask = new QueryTask(layerUrl );
      queryTask.execute(query, function(fset) { 
        dojo.forEach(fset.features,function(feature){
          attr = feature.attributes; 
          values.push({objectid:attr.OBJECTID_12, name:attr.NAME});				 				  
        });
      
        var s = ["<div class='list-group'>"];
        dojo.forEach(values,function(result){			  
          var param = result.objectid;
          s.push("<a href='#' class='list-group-item' " +
                 "data-dismiss='modal' id='" + param+"'>" + result.name + "</a>");
        });

        s.push("</div");
        dom.byId("categoryItemsList").style.display = "block";
        dom.byId("categoryItemsList").innerHTML = s.join("");
        
        dojoQuery(".list-group-item","categoryItemsList").on('click',thisObject.zoomTo);
      });
    },
    /**
     * Adds a graphic symbol to the map at the position corresponding to the
     * featured place selected.
     */
    addGraphicSymbol: function (evt) {
      var placeName, selectedPlace, pt, layerUrl, bQueryTask, bQuery;

      thisObject.map.infoWindow.hide();

      if (evt.target.innerText) {
        placeName = evt.target.innerText;
      } else {
        placeName = evt.target.textContent;
      }
        
      dojo.forEach(thisObject.config.map.featuredPlaces, function(place) {
        if(place.name === placeName) {
          selectedPlace = place;
          return;
        }
      });

      pt = webMercatorUtils.geographicToWebMercator(
          new Point(selectedPlace.lng,selectedPlace.lat));

      layerUrl = thisObject.getLayerUrl("Buildings");

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
        thisObject.map.graphics.clear();

        if(fset.features.length < 1) {
          thisObject.map.graphics.add(new Graphic(pt, defaultMarkerSymbol));
        }

        dojo.forEach(fset.features,function(feature) {
          feature.setSymbol(fillSymbol); 
          thisObject.map.graphics.add(feature); 
        });				
      });
    },
    /**
    * Load the Category drop down menu
    */
    loadCategories: function () {
      var mapService = this.config.map.gazeteerLayer + "/0";
      var queryTask = new QueryTask(mapService);
      var query = new Query();
      query.returnGeometry = false;
      query.outFields = ["Category"];
      query.where = "Category is not NULL";
      queryTask.execute(query,this.populateList);
    },

    populateList: function (results) {
      var category;
      var values = [];
      var testVals={};

      var features = results.features;
      dojo.forEach (features, function(feature) {
        category = feature.attributes.CATEGORY;
        if (!testVals[category]) {
          testVals[category] = true;
          values.push({name:category});
        }
      });
      
      values.sort(function(a, b) {
         var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
         if (nameA < nameB) {
          return -1; 
         }
         if (nameA > nameB) {
          return 1;
         }
         return 0;
      });
      
      selectElem = dom.byId("categoriesSelect");
      dojo.forEach (values, function(cat) {
        selectElem.options.add(new Option(cat.name, cat.name));
      });
    },
      
    handleQueryResults: function (results) {
        var features=[];
        thisObject.map.infoWindow.features = [];
        dojo.forEach(results, function (identifyResults) {
          dojo.forEach(identifyResults, function (result) {
            var feature = result.feature;
            var layerName = result.layerName;
            feature.setSymbol(fillSymbol);
            feature.attributes.layerName = layerName;
            if (dojo.indexOf(identifiableLayers,layerName)!==-1) {
              var mapLayerObject = parentLayerMap[layerName];
              feature.setInfoTemplate(mapLayerObject.infoTemplate);
              features.push(feature);
            }	
          });
        });

      if (features.length > 0) {
        thisObject.map.infoWindow.setFeatures(features);
        thisObject.map.infoWindow.show(clickedPoint);
      }
    },
      
    executeQueryTask : function (evt) { 
      tasks = [];
      thisObject.map.infoWindow.hide(); 
      thisObject.map.infoWindow.clearFeatures();
      thisObject.map.graphics.clear(); 
      featureSet = null;	
      
      clickedPoint = evt.mapPoint;
      identifyParams.geometry = thisObject.pointToExtent(thisObject.map,
                                  evt.mapPoint.x, evt.mapPoint.y,
                                  thisObject.config.configs.pointTolerance);
      identifyParams.mapExtent = thisObject.map.extent;
      identifyParams.width  = thisObject.map.width;
      identifyParams.height = thisObject.map.height;	  		
      dojo.forEach(thisObject.config.map.featureLayers,function (layer) {
        if (layer.identifyLayers.length > 0 && layer.layer.visibleAtMapScale) {
          tasks.push(layer.task);
        }
      });
      
      var deferreds = dojo.map(tasks,function(task){
          return task.execute(identifyParams);
      });
      promises = new all(deferreds);
      promises.then(thisObject.handleQueryResults);
    },
    /**
    * a utility function that converts a point coordinates to a map extent
    */
    pointToExtent: function (map, pointX, pointY, toleranceInPixel) {
      var pixelWidth = initExtent.getWidth() / map.width;
      var toleraceInMapCoords = toleranceInPixel * pixelWidth;
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
    hideGrid:function () {
      dom.byId("searchResults").innerHTML = "";
      dom.byId("searchText").value = "";
      dom.byId("searchResultsDiv").style.display = "none";
      thisObject.map.centerAndZoom(center,zoom);
      thisObject.map.graphics.clear();
    },

    /**
    * searches for a building using the building name given by the user
    */
    doFind : function () {
      dom.byId("searchResults").innerHTML ="";
      dom.byId("searchResultsDiv").style.display = "block";
      findParams.searchText = dom.byId('searchField').value;
      findTask.execute(findParams, thisObject.showResults);
      searchField = dojoQuery('#searchField')[0];
      searchField.value="";
    },

    /**
    * Zooms to the location of the building selected in the search results
    */
    zoomTo : function (item) {
      clickedAssetId = item.target.id;
      var markerSymbol = fillSymbol;
      thisObject.map.infoWindow.hide();
      var layer = thisObject.config.map.gazeteerLayer +"/0";
      var queryTask = new QueryTask(layer);
      var query = new Query(); 
      query.outSpatialReference = {"wkid":102100}; 
      query.returnGeometry = true; 
      query.objectIds = [clickedAssetId]; 
      queryTask.execute(query, function(fset) { 
        thisObject.map.graphics.clear(); 
        dojo.forEach(fset.features,function(feature) {
          var type = feature.geometry.type;
        
          var shapeExtent;
          if (type === "point") {
            markerSymbol = defaultMarkerSymbol;
            shapeExtent = thisObject.pointToExtent(thisObject.map,
                feature.geometry.x, feature.geometry.y, 80);
          } else {
            shapeExtent = feature.geometry.getExtent();
            var cntrPoint = shapeExtent.getCenter();
            shapeExtent = thisObject.pointToExtent(thisObject.map, cntrPoint.x, cntrPoint.y, 80);
          }
          
          feature.setSymbol(markerSymbol); 
          thisObject.map.graphics.add(feature); 
          thisObject.map.setExtent(shapeExtent);
        });				
      });
    },

    showExtent:function (extent) {
        var s = "";
        s = "XMin: "+ extent.xmin + "&nbsp;" +
            "YMin: " + extent.ymin + "&nbsp;" +
            "XMax: " + extent.xmax + "&nbsp;" +
            "YMax: " + extent.ymax + "&nbsp;" + extent.spatialReference.wkid;
        alert(s);
    },

    sortResults:function (results) {
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
    showResults:function (results) {
      thisObject.map.graphics.clear();
      var attribs;
      var s = ["<div class='list-group'>"];
      thisObject.sortResults(results);
      dojo.forEach(results,function(result){
        var graphic = result.feature;         
        attribs = result.feature.attributes;
        var addr = (attribs.Address.toLowerCase() !== "null") ? "<br/>" +attribs.Address : "";
        var param = attribs.OBJECTID_12 ;//+ "," + " \""+layerUrl +"\"";
        s.push("<a href='#' class='list-group-item' " +
               "data-dismiss='modal' id='" + param + "'>" +
               attribs.Name + "<br/>" + attribs.Category + addr + "</a>");
      });
    
      s.push("</div");
      dom.byId("searchResults").innerHTML = s.join("");
      dom.byId("searchResults").style.display = "block";
      dojoQuery(".list-group-item").on('click',thisObject.zoomTo);
    },
    
    clearBaseMap: function() {
      var map = this.map;
      if(map.basemapLayerIds.length > 0){
        array.forEach(map.basemapLayerIds, function(lid) {
          map.removeLayer(map.getLayer(lid));
        });
        map.basemapLayerIds = [];
      } else {
        map.removeLayer(map.getLayer(map.layerIds[0]));
      }
    },

    setBasemap: function(basemapText) {
      var map = this.map;
      var l, options;
      this.clearBaseMap();
      switch (basemapText) {
        case 'Water Color':
         options = {
            id: 'Water Color',
            copyright: 'stamen',
            resampling: true,
            subDomains: ['a','b','c','d']
         };
         l = new WebTiledLayer('http://${subDomain}.tile.stamen.com' +
             '/watercolor/${level}/${col}/${row}.jpg',options);
         map.addLayer(l);
         break;

        case 'MapBox Space':
          options = {
            id:'mapbox-space',
            copyright: 'MapBox',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com' +
              '/v3/eleanor.ipncow29/${level}/${col}/${row}.jpg',options);
          map.addLayer(l);
          break;

        case 'Pinterest':
          options = {
            id:'mapbox-pinterest',
            copyright: 'Pinterest/MapBox',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3' +
              '/pinterest.map-ho21rkos/${level}/${col}/${row}.jpg',options);
          map.addLayer(l);
          break;

        case 'Streets':
          map.setBasemap('streets');
          break;

        case 'Imagery':
          map.setBasemap('hybrid');
          break;

        case 'National Geographic':
          map.setBasemap('national-geographic');
          break;

        case 'Topographic':
          map.setBasemap('topo');
          break;

        case 'Gray':
          map.setBasemap('gray');
          break;

        case 'Open Street Map':
          map.setBasemap('osm');
          break;
      }
    }
  });
});
