define([
  'dojo/_base/declare',
  'dojo/_base/array',
"dojo/keys",
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'esri/dijit/Scalebar',
  'esri/dijit/LocateButton',
  'esri/dijit/Geocoder',
  "esri/dijit/HomeButton",
  'components/bootstrapmap/bootstrapmap',
"esri/dijit/PopupTemplate","dojo/promise/all",
  'dojo/text!./templates/Map.html',
  "dojo/ready",	"esri/dijit/Bookmarks",	"esri/Color",	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleMarkerSymbol",	"esri/symbols/SimpleFillSymbol",	"esri/symbols/PictureMarkerSymbol",	"esri/dijit/PopupMobile",/*"esri/dijit/Popup",*/"esri/dijit/BasemapGallery",	"esri/dijit/BasemapLayer",	"esri/dijit/Basemap",	"esri/dijit/Legend",	"esri/toolbars/edit","esri/InfoTemplate","esri/geometry/Point",	"esri/geometry/Extent",	"esri/layers/FeatureLayer",	"esri/layers/ArcGISTiledMapServiceLayer",	"esri/layers/ArcGISDynamicMapServiceLayer",	"esri/tasks/locator",	"esri/tasks/query",	"esri/tasks/QueryTask",	"esri/tasks/FindTask",	"esri/tasks/FindParameters","esri/tasks/IdentifyTask","esri/tasks/IdentifyParameters","esri/graphic",	"esri/map",	"esri/urlUtils",	"esri/geometry/webMercatorUtils",	"dojo/data/ItemFileReadStore",	"dojo/dom",	"dojo/dom-construct","dojo/on",	"dojo/parser",	"agsjs/dijit/TOC","dojo/query"//,"toc/TableOfContents"
], function( declare, array,keys,
  _WidgetBase, _TemplatedMixin,
  Scalebar, LocateButton, Geocoder,HomeButton,
  BootstrapMap,PopupTemplate,all,
  template,ready, Bookmarks, Color, SimpleLineSymbol, 
             SimpleMarkerSymbol,SimpleFillSymbol,PictureMarkerSymbol, PopupMobile,BasemapGallery,BasemapLayer,Basemap,Legend,Edit, InfoTemplate, Point,
             Extent,FeatureLayer,ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer,Locator, 
             Query,QueryTask,FindTask,FindParameters,IdentifyTask,IdentifyParameters, Graphic,Map,urlUtils ,webMercatorUtils,ItemFileReadStore,dom,domConstruct, on, parser, TOC,dojoQuery)//,TableOfContents)
{
	parser.parse();
	var movable = false;
	var loadCount = 0;
	var vtbasemap;
	
	var initExtent;
	var clickedPoint;
	var url = "";
	var userCurrentAddress;
	var bookmarks ;	
	var basemapGallery;
	//var map;
	var thisObject;
	var findTask, findParams,locator,editToolbar;
	var picSymbol, theGraphic;
	var plQueryTask, plQuery,bQueryTask, bQuery,bsQueryTask, bsQuery, brQueryTask,brQuery;
	var symbol;
	var fillSymbol;
	var layers=[];
	var layerCount = 0;
	var bookmarkWidget;
	var defaultMarkerSymbol;
	var searchResultZoom, initialMapZoom, searchResultExtentTolerance;
	
	var layersData = [];
	var identifyParams;
	var tasks=[];
	var identifiableLayers = [];
	var parentLayerMap = {};
  
  return declare([_WidgetBase, _TemplatedMixin], {
    
    templateString: template,
    postCreate: function() {
      thisObject = this;
	  this.inherited(arguments);
      this.loadConfigs();
	  
      //this._initMap();
    },
	
	loadConfigs:function(){
		vtbasemap = new ArcGISTiledMapServiceLayer(this.config.map.basemaps.vtBasemap);
		
		//locator = new Locator(this.config.map.locatorService);
		//locator.on("address-to-locations-complete", this.showLocationResults);
		
		dojoQuery("#featuredBookmarks").on('click',this.addGraphicSymbol);
		
		dojoQuery("#imgFrame").on('click',this.addGraphicSymbol);
		//dojoQuery("#showLocationButton").on('click',this.showGeolocation);
		dojoQuery("#locateButton").on('click',this.locate);
		dojoQuery("#closeLink").on('click',this.hideGrid);
		//dojoQuery("#searchButton").on('click',this.doFind);
		/*categs = dojoQuery("#categories");
		categs.on('click',function(){
			dom.byId("categoryItemsList").innerHTML = "";
			dom.byId("categoryItemsList").style.display = "none";
		});*/
	
		//categoriesMenu = dijit.byId("categoriesSelect");
		//dojo.connect(categoriesMenu,'onChange',this.updateSelect);
		categoriesContent = dom.byId("categoriesContent");
		categoriesContent.innerHTML = "<select id='categoriesSelect' name='categoriesSelect' class='form-control' > \
		<option selected>Select Category</option>\
                            </select>\
                            <div class='itemsList' id='categoryItemsList'>\
                            </div>";
		searchResultsContent = dom.byId("searchResultsDiv");
		searchResultsContent.innerHTML = "<div class='itemsList' id='searchResults'></div>";
		
		dojoQuery("#categoriesSelect").on('change',this.updateSelect);
		
		//dojoQuery("#categoryListItem").on('click',this.zoomTo);
		
		dojoQuery("input[type='text']").on("keydown", function(event) {
        //query returns a nodelist, which has an on() function available that will listen
        //to all keydown events for each node in the list
        switch(event.keyCode) {
            case keys.ENTER:
                
          event.preventDefault();
          dojoQuery('.searchResults-modal').modal('show');;
          if (dojoQuery('.navbar-collapse.in', this.domNode).length > 0) {
          //e.stopPropagation();
          dojoQuery('.navbar-toggle', this.domNode)[0].click();
        }
		  dom.byId("searchResults").innerHTML = "";
		  dom.byId("searchResults").style.display = "none";
		  
      
				thisObject.doFind();
                break;
            default:
                console.log("some other key: " + event.keyCode);
        }
    });
		
		
		var urlObject = urlUtils.urlToObject(document.location.href);
		if (urlObject.query) 
		{
			if (urlObject.query.lon && urlObject.query.lat) 
			{
				var lon = parseFloat(urlObject.query.lon);
				var lat = parseFloat(urlObject.query.lat);
				this.map.options.center = [lon, lat];
				this.map.options.zoom = 7;
			}
		}


	
		symbol = new SimpleMarkerSymbol(SimpleFillSymbol.STYLE_SOLID, 8, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,255,197]), 1), new Color([0,255,197, 1.00]));
		fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 2), new Color([255,255,0,0.5])); 
		this.config.map.options.infoWindow = new PopupMobile(null, domConstruct.create("div"));
      	this.map = BootstrapMap.create(this.mapNode, this.config.map.options);
		/*this.map.on("load",function(){
			alert("map loaded");
			thisObject._initMap();
		});*/
		//
		
		if ( vtbasemap.loaded ) 
		{
			this._initMap();
		} 
		else 
		{
			//func = dojo.hitch(thisObj,this._initMap);
			
			vtbasemap.on('load',dojo.hitch(thisObject,this._initMap));
		}
		//this._initMap();
		
	},
	formatContent:function(key,value,data){
		
		return value.replace("Null","");
	},
    _initMap: function() {
	  
	  //this.map.addLayer(vtbasemap);
      
	  dojo.forEach(this.config.map.featureLayers, function(layer, index)
	  {
			var featurelayer = new ArcGISDynamicMapServiceLayer(layer.layerURL ,{"opacity":layer.opacity,"visible":layer.visible});
			layer.layer = featurelayer;
			layers.push(featurelayer);
			layerCount++;	
			if(layerCount === thisObject.config.map.featureLayers.length)
			{
				thisObject.map.addLayers(layers);
			}
	  });

		this.map.infoWindow.on('hide',function(){
			thisObject.map.graphics.clear();
	
		});
		
		
		this.map.on('layers-add-result',function(results)
		{
			var layerInfo = dojo.map(thisObject.config.map.featureLayers, function(result)
												{
													return {layer:result.layer,title:result.label,noLayers:true};			
												});
			layerInfo = layerInfo.reverse();
			var standardTOC = new TOC({map: thisObject.map,  layerInfos:layerInfo  }, 'standardDiv');
			standardTOC.startup();
		
		
			if(layerInfo.length > 0)
			{
				var legendDijit = new Legend({map:thisObject.map,layerInfos:layerInfo},"legendDiv");
				legendDijit.startup();
			}		
		
			initExtent = new Extent( thisObject.map.extent.xmin, thisObject.map.extent.ymin, thisObject.map.extent.xmax, thisObject.map.extent.ymax, 		thisObject.map.spatialReference );
			thisObject.map.enableScrollWheelZoom();
			var homeBttn = new HomeButton({
        		map: thisObject.map
      		}, "HomeButton");
      		homeBttn.startup();
	
			var bookmarksExtent = [];
			for (var i = 0; i < thisObject.config.map.featuredPlaces.length; i++) 
			{
				var bookmarkItem = thisObject.config.map.featuredPlaces[i];
				var bookmarktItemExtent = {};
				bookmarktItemExtent.name = bookmarkItem.name;
				var geom = webMercatorUtils.geographicToWebMercator(new Point(bookmarkItem.lng,bookmarkItem.lat));
				bookmarktItemExtent.extent = thisObject.pointToExtent(thisObject.map,geom.x,geom.y,thisObject.config.configs.searchResultExtentTolerance);
				bookmarksExtent.push(bookmarktItemExtent);
			}
			bookmarks = bookmarksExtent;
			bookmarkWidget = new Bookmarks({map: thisObject.map, bookmarks:bookmarks}, dom.byId("featuredBookmarks"));  				
		});
		
			
		this.map.on("click", this.executeQueryTask);
	
		
		identifyParams = new esri.tasks.IdentifyParameters();
		identifyParams.tolerance = 5;
		identifyParams.returnGeometry = true;
		identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
		
		dojo.forEach(this.config.map.featureLayers, function(layer)
		{
			if (layer.identifyLayers.length > 0) 
			{
				layer.task = new esri.tasks.IdentifyTask(layer.layerURL);
				dojo.forEach(layer.identifyLayers, function (b) 
				{
					// read the identifyLayers array property in each service to get a list of the layers (b) we want to enable identify on
					identifiableLayers.push(b.layerName);
					// the parentLayerMap stores a reference to the identifiableLayer member itself keyed by the string representation of each name, for use later.
					parentLayerMap[b.layerName]= b;
					// within identifiable layer, iterate over the fields.
					infoTemplateHTMLString = "<table>";
					dojo.forEach(b.fields, function (c) 
					{
						// store infotemplate in data structure for each field (c).
						//infoTemplateHTMLString = infoTemplateHTMLString + "<tr>"+ c + ":<td> ${" + c + "}</tr> </td><br>"
						infoTemplateHTMLString = infoTemplateHTMLString + "<tr><td style='vertical-align: text-top;padding-right:10px;'>"+ c.title + "</td><td> " + c.value + "</td> </tr>"
					});
					infoTemplateHTMLString += "</table>";
					// now we add a member to each layer object for the info template.
					b.infoTemplate = new esri.InfoTemplate({title:b.title,content:infoTemplateHTMLString});
				});
			}
		});
	
	//findTask = new FindTask(gazeteerLayer+"/");
	findTask = new FindTask(this.config.map.gazeteerLayer+"/");
	//findTask = new FindTask(getLayerUrl("Buildings")+"/" );
	findParams = new FindParameters();
	findParams.searchFields = ["NAME"];
	findParams.returnGeometry = true;
	findParams.layerIds = [0];
	findParams.outSpatialReference = {"wkid":102100};

	
	
	this.loadCategories();
	//dojo.connect(map, "onExtentChange", showExtent);
	
	defaultMarkerSymbol = new PictureMarkerSymbol({"angle":0,"xoffset":-12,"yoffset":12,"type":"esriPMS","url":this.config.configs.PictureMarker,"contentType":"image/png","width":24,"height":24});
	  
	  
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
		var vtBasemapLayer = new BasemapLayer({url:thisObject.config.map.basemaps.vtBasemap});
		var natGeoBasemapLayer = new BasemapLayer({url:thisObject.config.map.basemaps.basemapNG});
		var TOBBasemapLayer = new BasemapLayer({url:thisObject.config.map.basemaps.basemapTOB});
		var schematicBasemap = new Basemap(
		{ 	id:	"bmSchematic",
			layers: [natGeoBasemapLayer,TOBBasemapLayer,vtBasemapLayer],
			title: "VT Campus",
			thumbnailUrl: thisObject.config.map.basemaps.schematicThumbnail
		});
		basemaps.push(schematicBasemap);
		var pictometryImageryBasemapLayer = new BasemapLayer({ url:thisObject.config.map.basemaps.pictometry  });
		var basemapImagery = new Basemap({  layers: [pictometryImageryBasemapLayer], id: "bmImagery",  title: "Aerial Photo",thumbnailUrl:thisObject.config.map.basemaps.pictometryThumbnail});
		basemaps.push(basemapImagery);        
		basemapGallery = new BasemapGallery({  showArcGISBasemaps: false,  basemaps: basemaps,  map: thisObject.map}, "basemapGallery");
		basemapGallery.startup();
		basemapGallery.select("bmSchematic");
	  
    },

///////////////////////////////////////////////////////////////
/**
* Gets the URL of the layer given the layer name. The function looks up the layername in the feature layers array.
*/
getLayerUrl: function (layerName)
{	

	for (i = 0; i< this.config.map.featureLayers.length; i++)
	{
		if (this.config.map.featureLayers[i].label === layerName)
		{
			return this.config.map.featureLayers[i].layerURL;
		} 
	}
},
/**
* Update the second drop down menu with the options corresponding to the category selected in the first drop down menu.
* the options are retrieved by quering the mapservice layer corresponding to the category selected.
*/
updateSelect: function (selectedItem)
{
	var layerUrl = thisObject.config.map.gazeteerLayer + "/0";//"http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/VTPlaceNames/MapServer/0";
	if (selectedItem === "Select Category")
		return;
	var name = selectedItem.target.value;
	var query = new Query();  
	query.returnGeometry = false; 
	
	query.outFields = ["OBJECTID_12","Name"];
	query.where = "Category = '" + name +"'";
	//query.where  = "Name is not NULL";
	query.orderByFields = ["Name ASC"];
		
	var dataItems ,values = [], attr;
	var queryTask = new QueryTask(layerUrl );
	//queryTask.disableClientCaching = true;           
	queryTask.execute(query, function(fset) 
	{ 
		
			dojo.forEach(fset.features,function(feature){
				attr = feature.attributes; 
				//if(attr.NAME.length > 1)				 
				values.push({objectid:attr["OBJECTID_12"], name:attr.NAME});				 				  
			});
			
		
		
		var s = ["<div class='list-group'>"];
        dojo.forEach(values,function(result){			  
			var param = result.objectid;
		   //s.push("<tr><td class='categoryResultItem' onclick='zoomTo("+ param + ")'>" + result.name + " </td> </tr>");
		   s.push("<a href='#' class='list-group-item' data-dismiss='modal' id='" + param+"'>" + result.name + "</a>");
		   
        });
		
		
        s.push("</div");
		dom.byId("categoryItemsList").style.display = "block";
        dom.byId("categoryItemsList").innerHTML = s.join("");
		
		//l=dojoQuery(".list-group-item");
		//l.on('click',this.zoomTo);
		dojoQuery(".list-group-item","categoryItemsList").on('click',thisObject.zoomTo);
			  						
	});
	
	
	
},
///////////////////////////////////////////////////////////////////////////////////////
/**
* Adds a graphic symbol to the map at the position corresponding to the featured place selected.
*/
addGraphicSymbol: function (evt)
{
	//alert(evt.target.innerText);
	thisObject.map.infoWindow.hide();
	var placeName = "";
	if(evt.target.innerText)
		placeName = evt.target.innerText;
	else
		placeName = evt.target.textContent;
	var selectedPlace;
	picSymbol = defaultMarkerSymbol;		
		
	dojo.forEach(thisObject.config.map.featuredPlaces, function(place){
		if(place.name === placeName)
		{
			selectedPlace = place;
			return;
		}
	});
	var pt = webMercatorUtils.geographicToWebMercator(new Point(selectedPlace.lng,selectedPlace.lat));
	var layerUrl = thisObject.getLayerUrl("Buildings");
	bQueryTask = new QueryTask(layerUrl+"/0");  
	bQuery = new Query(); 
	bQuery.outSpatialReference = {"wkid":102100}; 
	bQuery.returnGeometry = true; 
	bQuery.outFields = ["BLDG_USE", "NAME", "BLDG_NUM", "STNUM", "STPREDIR", "STNAME", "STSUFFIX", "STPOSTDIR","URL"];
	bQuery.geometry = pt; 
	bQueryTask.execute(bQuery, function(fset) { 
		thisObject.map.graphics.clear(); 
		if(fset.features.length < 1)
		{
			var graphic = new Graphic(pt,picSymbol);			
			thisObject.map.graphics.add(graphic);
		}
		
		dojo.forEach(fset.features,function(feature){			
			feature.setSymbol(fillSymbol); 
			thisObject.map.graphics.add(feature); 
		});				
	});
	
},
/////////////////////////////////////////////////////////////////////////////////////
/**
* Load the Category drop down menu
*/
loadCategories:function ()
{
	var mapService = this.config.map.gazeteerLayer+ "/0";//"http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/VTPlaceNames/MapServer/0";
	var queryTask = new QueryTask(mapService);
	//queryTask.disableClientCaching = true; 

   var query = new Query();
   query.returnGeometry = false;
   query.outFields = ["Category"];
   query.where = "Category is not NULL";
   queryTask.execute(query,this.populateList);
},

populateList:function (results)
{
	var category;
	var values = [];
	var testVals={};

	//Add option to display all zoning types to the ComboBox
	//values.push({name:"ALL"})

	//Loop through the QueryTask results and populate an array
	//with the unique values
	var features = results.features;
	dojo.forEach (features, function(feature) {
	  category = feature.attributes.CATEGORY;
	  if (!testVals[category]) {
		testVals[category] = true;
		values.push({name:category});
	  }
	});
	//Create a ItemFileReadStore and use it for the
	//ComboBox's data source
	
	values.sort(function(a, b)
	{
		 var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
		 if (nameA < nameB) //sort string ascending
			return -1 
		 if (nameA > nameB)
			return 1
		 return 0 //default return value (no sorting)
	})
	
	/*var dataItems = {
		   identifier: 'name',
		   label: 'name',
		   items: values
	};
	var store = new ItemFileReadStore({data:dataItems});
	dijit.byId("categoriesSelect").set("store",store);*/
	selectElem = dom.byId("categoriesSelect");
	dojo.forEach (values, function(cat) {
	  selectElem.options.add(new Option(cat.name, cat.name))
	});
},
	
	handleQueryResults:function (results) {
          //console.log("queries finished: ", results);
          //var parcels, buildings;
		  var features=[];
		  thisObject.map.infoWindow.features = [];
          // make sure both queries finished successfully
          dojo.forEach(results, function (identifyResults){
		  	
				dojo.forEach(identifyResults, function (result){
					var feature = result.feature;
                var layerName = result.layerName;
				feature.setSymbol(fillSymbol);
                feature.attributes.layerName = layerName;
				if (dojo.indexOf(identifiableLayers,layerName)!=-1) {
				  // an indexOf -1 means it was not found.  Anything else means our layer name is in there.
				  
				  // NEW: use the infoTemplate from the layer as defined in setupIdentify()
				  //get the parent object for each layer name so we can grab the infoTemplate.
				  var mapLayerObject = parentLayerMap[layerName];
				  feature.setInfoTemplate(mapLayerObject.infoTemplate);
				  features.push(feature);
			  }	
			  });
			  
			
		  });
		  if (features.length > 0)
		  {
		  	thisObject.map.infoWindow.setFeatures(features);
			
    		//thisObject.map.infoWindow.show(identifyParams.geometry);
			thisObject.map.infoWindow.show(clickedPoint);
		  }
        },
	
	executeQueryTask:function (evt) 
	{ 
		tasks = [];
		thisObject.map.infoWindow.hide(); 
		thisObject.map.infoWindow.clearFeatures();
		thisObject.map.graphics.clear(); 
		featureSet = null;	
		
		//identifyParams.geometry = evt.mapPoint;
		clickedPoint = evt.mapPoint;
		identifyParams.geometry = thisObject.pointToExtent(thisObject.map, evt.mapPoint.x, evt.mapPoint.y, thisObject.config.configs.pointTolerance);
        identifyParams.mapExtent = thisObject.map.extent;
        identifyParams.width  = thisObject.map.width;
        identifyParams.height = thisObject.map.height;	  		
		/*var vis = dojo.map(thisObject.config.map.featureLayers,function(featureLayer){
			if (featureLayer.identifyLayers.length > 0)
				return featureLayer.layer.visibleAtMapScale;
		});
		console.log(vis);*/
		dojo.forEach(thisObject.config.map.featureLayers,function (layer){
			if (layer.identifyLayers.length > 0 && layer.layer.visibleAtMapScale)
				tasks.push(layer.task);
		});
		
		
		var deferreds = dojo.map(tasks,function(task){
		    return task.execute(identifyParams);
		});
		promises = new all(deferreds);
        promises.then(thisObject.handleQueryResults);
	}  ,
	///////////////////////////////////////////////////////////////
	/**
	* a utility function that converts a point coordinates to a map extent
	*/
	pointToExtent:function (map, pointX, pointY, toleranceInPixel) 
	{
		//var pixelWidth = map.extent.getWidth() / map.width;
		var pixelWidth = initExtent.getWidth() / map.width;
		var toleraceInMapCoords = toleranceInPixel * pixelWidth;
		return new Extent( pointX - toleraceInMapCoords, pointY - toleraceInMapCoords, pointX + toleraceInMapCoords, pointY + toleraceInMapCoords, map.spatialReference );                           
	},
	///////////////////////////////////////////////////////////////
	/**
	* hide the search results when the user clicks on the x button
	*/
	hideGrid:function ()
	{
		/*var newStore = new dojo.data.ItemFileReadStore({data: {  identifier: "",  items: []}});
		var grid = dijit.byId("grid");
		grid.setStore(newStore);*/
		dom.byId("searchResults").innerHTML = "";
		dom.byId("searchText").value = "";
		dom.byId("searchResultsDiv").style.display = "none";
		thisObject.map.centerAndZoom(center,zoom);
		thisObject.map.graphics.clear();
	},
	///////////////////////////////////////////////////////////////
	/**
	* searches for a building using the building name given by the user
	*/
	doFind:function () 
	{
		dom.byId("searchResults").innerHTML ="";
		dom.byId("searchResultsDiv").style.display = "block";
		findParams.searchText = dom.byId('searchField').value;
		findTask.execute(findParams, thisObject.showResults);
		searchField = dojoQuery('#searchField')[0];
		searchField.value="";
	},
	///////////////////////////////////////////////////////////////
	/**
	* Zooms to the location of the building selected in the search results
	*/
	//function zoomTo(clickedAssetId, layerUrl)
	zoomTo:function (item)
	{
		clickedAssetId = item.target.id;
		//var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(selectedPlace.lng,selectedPlace.lat));
		var makrerSymbol = fillSymbol;
		thisObject.map.infoWindow.hide();
		var layer = thisObject.config.map.gazeteerLayer +"/0";
		var queryTask = new QueryTask(layer);
		//queryTask.disableClientCaching = true;   
		var query = new Query(); 
		query.outSpatialReference = {"wkid":102100}; 
		query.returnGeometry = true; 
	//	bQuery.outFields = ["BLDG_USE", "NAME", "BLDG_NUM", "STNUM", "STPREDIR", "STNAME", "STSUFFIX", "STPOSTDIR","URL"];
		query.objectIds = [clickedAssetId]; 
		queryTask.execute(query, function(fset) { 
			thisObject.map.graphics.clear(); 
			//alert(fset.features.length);
			dojo.forEach(fset.features,function(feature){	
				//alert(feature);		
				var type = feature.geometry.type;
			
				//alert(type);
				var shapeExtent;
				if (type === "point")
				{
					
					makrerSymbol = defaultMarkerSymbol;
								
					shapeExtent = thisObject.pointToExtent(thisObject.map, feature.geometry.x, feature.geometry.y, 80);
				}
				else
				{
					shapeExtent = feature.geometry.getExtent();
					var cntrPoint = shapeExtent.getCenter();
					shapeExtent= thisObject.pointToExtent(thisObject.map, cntrPoint.x, cntrPoint.y, 80);
				}
				
				feature.setSymbol(makrerSymbol); 
				thisObject.map.graphics.add(feature); 
				thisObject.map.setExtent(shapeExtent);
			});				
		});
		//dom.byId("categoryItemsList").innerHTML = "";
		//dom.byId("categoryItemsList").style.display = "none";
        
	},
	///////////////////////////////////////////////////////////////
	showExtent:function (extent) {
			var s = "";
			s = "XMin: "+ extent.xmin + "&nbsp;"
			   +"YMin: " + extent.ymin + "&nbsp;"
			   +"XMax: " + extent.xmax + "&nbsp;"
			   +"YMax: " + extent.ymax + "&nbsp;" + extent.spatialReference.wkid;
			alert(s);
		  },


	///////////////////////////////////////////////////////////////
	sortResults:function (results)
	{
		results.sort(function(a, b)
		{
			 var nameA=a.feature.attributes.Name.toLowerCase(), nameB=b.feature.attributes.Name.toLowerCase();
			 if (nameA < nameB) //sort string ascending
				return -1 
			 if (nameA > nameB)
				return 1
			 return 0 //default return value (no sorting)
		})
	},
	///////////////////////////////////////////////////////////////
	/**
	* Shows the results of searching of a building
	*/
	showResults:function (results) 
	{
		thisObject.map.graphics.clear();
		var attribs;
	
		//var s = ["<table>"];
		var s = ["<div class='list-group'>"];
		thisObject.sortResults(results);
			dojo.forEach(results,function(result){
				var graphic = result.feature;         
				//map.graphics.add(graphic);
			  attribs = result.feature.attributes;
		   
		   
			   //var layerUrl = getLayerUrl("Buildings") + "/0";
			   var addr = (attribs.Address.toLowerCase() != "null") ? "<br/>" +attribs.Address : "";
			   /*var stdir =(attribs.STPREDIR.toLowerCase() != null) ? attribs.STPREDIR : "";
				var stsuff = (attribs.STSUFFIX.toLowerCase() != null) ? attribs.STSUFFIX : "";
				var stpostdir = (attribs.STPOSTDIR.toLowerCase() != null) ? attribs.STPOSTDIR : "";
			
				var strcontent = attribs.STNUM + " " + stdir + " " + attribs.STNAME + " " + stsuff + " " + stpostdir ;*/
			
				var param = attribs.OBJECTID_12 ;//+ "," + " \""+layerUrl +"\"";
			  // s.push("<tr onClick='zoomTo("+param +")'><td class='categoryResultItem searchResultItem'>" + attribs.NAME + "<br/>" + attribs.BLDG_USE + "<br/>" + strcontent + "</td></tr>");
			   //s.push("<tr id='"+param +"'><td class='categoryResultItem searchResultItem'>" + attribs.Name + "<br/>" + attribs.Category + addr + "</td></tr>");
		   s.push("<a href='#' class='list-group-item' data-dismiss='modal' id='" + param+"'>" + attribs.Name + "<br/>" + attribs.Category + addr + "</a>");
			});
		
			s.push("</div");
			//s.push("</table>");
			dom.byId("searchResults").innerHTML = s.join("");
			dom.byId("searchResults").style.display = "block";
			dojoQuery(".list-group-item").on('click',thisObject.zoomTo);
	},
	
	clearBaseMap: function(){
      var map = this.map;
      if(map.basemapLayerIds.length > 0){
        array.forEach(map.basemapLayerIds, function(lid){
          map.removeLayer(map.getLayer(lid));
        });
        map.basemapLayerIds = [];
      }else{
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
            id:'Water Color',
            copyright: 'stamen',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tile.stamen.com/watercolor/${level}/${col}/${row}.jpg',options);
          map.addLayer(l);
          break;

        case 'MapBox Space':

          options = {
            id:'mapbox-space',
            copyright: 'MapBox',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/eleanor.ipncow29/${level}/${col}/${row}.jpg',options);
          map.addLayer(l);
          break;

        case 'Pinterest':
          options = {
            id:'mapbox-pinterest',
            copyright: 'Pinterest/MapBox',
            resampling: true,
            subDomains: ['a','b','c','d']
          };
          l = new WebTiledLayer('http://${subDomain}.tiles.mapbox.com/v3/pinterest.map-ho21rkos/${level}/${col}/${row}.jpg',options);
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