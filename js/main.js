define([
  'dojo/_base/declare',
  'bootstrapMap',
  'vtCampusMap/config',
  'vtCampusMap/exceptions',
  'dojo/_base/array',
  'dojo/_base/lang',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/dijit/HomeButton',
  'esri/dijit/LocateButton',
  './widgets/navbar/main',
  'esri/symbols/PictureMarkerSymbol',
  'esri/dijit/Scalebar'
], function (declare, bootstrapMap, config, ex, array, lang,
             ArcGISDynamicMapServiceLayer, HomeButton, LocateButton,
             NavBar, PictureMarkerSymbol, Scalebar) {
  return declare([], {
    constructor: function () {
      this.map = bootstrapMap.create('vt-campus-map', config.map);
      this.markerSymbol = new PictureMarkerSymbol(config.markerSymbol, 24, 50);
      this.layers = [];
      this.addEventListeners();
      for(var layerType in config.layerInfos) { this.addLayers(layerType); }
      this.map.addLayers(this.layers);
      annyang.start();
    },

    addEventListeners: function () {
      this.map.on('layers-add-result', lang.hitch(this.map, 'enableScrollWheelZoom')); 
      this.map.on('layers-add-result', lang.hitch(this, 'addWidgets')); 
    },

    addLayers: function (layerType) {
      array.forEach(config.layerInfos[layerType], lang.hitch(this, function (layerInfo) {
        switch(layerType) {
          case 'featureLayers':
            layerInfo.layer = new ArcGISDynamicMapServiceLayer(layerInfo.url, layerInfo);
            this.layers.push(layerInfo.layer);
            break;
          default:
            throw new ex.ValueError('Incorrect layer type "' + layerType + '"');
        }
      }));
    },

    addWidgets: function () {
      this.addHomeButton();
      this.addLocateButton();
      this.addScalebar();
      this.addNavbar();
    },

    addNavbar: function () {
      new NavBar({
        map: this.map,
        layerInfos: config.layerInfos.featureLayers,
        layers: this.layers,
        markerSymbol: this.markerSymbol
      }, 'vt-navbar');
    },

    addScalebar: function () {
      new Scalebar({ map: this.map, scalebarUnit: 'dual' });
    },

    addHomeButton: function () {
      var homeButton;

      homeButton = new HomeButton({ map: this.map }, 'home-button');
      homeButton.startup();
    },

    addLocateButton: function () {
      var locateButton;

      locateButton = new LocateButton({
        map: this.map,
        scale: 7000,
        symbol: this.markerSymbol
      }, 'locate-button');
    },
  });
});
