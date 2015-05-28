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
  'esri/dijit/Scalebar',
  './widgets/map_info_manager/main',
  'esri/dijit/PopupMobile',
  'dojo/dom-construct',
  'esri/Color',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol'
], function (declare, bootstrapMap, config, ex, array, lang,
             ArcGISDynamicMapServiceLayer, HomeButton, LocateButton,
             NavBar, PictureMarkerSymbol, Scalebar, MapInfoMgr,
             PopupMobile, domConstruct, Color, SimpleLineSymbol, SimpleFillSymbol) {

  return declare([], {
    lineColor: new Color([255, 0, 0]),

    fillColor: new Color([255, 255, 0, 0.5]),

    constructor: function () {
      this.borderSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, this.lineColor, 5),
          this.fillColor);

      lang.mixin(config.map, {
        infoWindow: new PopupMobile({
          fillSymbol: this.borderSymbol
        }, domConstruct.create('div'))
      });


      this.map = bootstrapMap.create('vt-campus-map', config.map);
      this.markerSymbol = new PictureMarkerSymbol(config.markerSymbol, 24, 50);
      this.layers = [];
      this.addEventListeners();
      this.addLayers();
      annyang && annyang.start();
    },

    addMapInfoMgr: function () {
      new MapInfoMgr({
        map: this.map,
        layerInfos: config.layerInfos
      });
    },

    addEventListeners: function () {
      this.map.on('layers-add-result', lang.hitch(this.map, 'enableScrollWheelZoom')); 
      this.map.on('layers-add-result', lang.hitch(this, 'addWidgets')); 
    },

    addLayers: function () {
      this.layers = array.map(config.layerInfos, function (layerInfo) {
        layerInfo.layer = new ArcGISDynamicMapServiceLayer(layerInfo.url, layerInfo);
        return layerInfo.layer;
      });
      this.map.addLayers(this.layers);
    },

    addWidgets: function () {
      this.addHomeButton();
      this.addLocateButton();
      this.addScalebar();
      this.addNavbar();
      this.addMapInfoMgr();
    },

    addNavbar: function () {
      this._navbar = new NavBar({
        map: this.map,
        layerInfos: config.layerInfos,
        layers: this.layers,
        markerSymbol: this.markerSymbol,
        borderSymbol: this.borderSymbol
      }, 'vt-navbar');
    },

    addScalebar: function () {
      this._scalebar = new Scalebar({ map: this.map, scalebarUnit: 'dual' });
    },

    addHomeButton: function () {
      this._homeButton = new HomeButton({ map: this.map, id: 'home-button' });
      this.map.root.appendChild(this._homeButton.domNode);
      this._homeButton.startup();
    },

    addLocateButton: function () {
      this._locateButton = new LocateButton({
        map: this.map,
        scale: 7000,
        symbol: this.markerSymbol,
        id: 'locate-button'
      });

      this.map.root.appendChild(this._locateButton.domNode);
    },

    destroy: function () {
      this._homeButton && this._homeButton.destroy();
      this._locateButton && this._locateButton.destroy();
      this._scalebar && this._scalebar.destroy();
      this._navbar && this._navbar.destroy();
      this.map.destroy();
    }
  });
});
