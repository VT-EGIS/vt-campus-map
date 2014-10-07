define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/on',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-class',
  'dojo/text!./templates/maptype_gallery_item.html',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'dojo/Evented'
], function (declare, _WidgetBase, domConstruct, query, on, lang, array,
             domClass, mapTypeGalleryItemTemplate,
             ArcGISDynamicMapServiceLayer, Evented) {
  return declare([_WidgetBase, Evented], {
    constructor : function (opts, elementID) {
      this._elementID = elementID;
      this._currentMapTypeIndex = -1;
      this._mapTypeElements = [];
      lang.mixin(this, opts);
      this._loadMapTypes();
    },

    postCreate: function() {
      this.inherited(arguments);
      this._createGallery();
      this._getGalleryElements();
      this._attachEventHandlers();
      this.selectMapType(this.defaultMapTypeIndex);
    },

    _getGalleryElements : function () {
      this._mapTypeElements = query('li', this.domNode);
    },

    _loadMapTypes : function () {
      var _this, map;

      _this = this;
      map = this.getMap();

      array.forEach(this.mapTypes, function(mapType) {
        mapType.layers = array.map(mapType.layerInfos, function(layerInfo) {
          var serviceLayer;

          serviceLayer = new ArcGISDynamicMapServiceLayer(layerInfo.url, layerInfo);
          serviceLayer.hide();
          map.addLayer(serviceLayer, 1);

          return serviceLayer;
        });
      });
    },

    _attachEventHandlers : function () {
      var _this;

      _this = this;

      on(this.domNode, 'img:click', function (evt) {
        var id, index;

        id = evt.target.id;
        index = id[id.length - 1];

        _this.selectMapType(index);

        _this.onSelectHandler();
      });
    },

    getMap : function () {
      return this.map;
    },

    setCurrentMapType : function(index) {
      this._currentMapTypeIndex = index;
      domClass.add(this._mapTypeElements[index], 'mapType-selected');
    },

    selectMapType : function (index) {
      var map, oldMapType, oldMapTypeIndex, mapType;

      map = this.getMap();
      oldMapTypeIndex = this.getCurrentMapTypeIndex();

      if(oldMapTypeIndex === index) {
        return;
      }

      if(oldMapTypeIndex !== -1) {
        domClass.remove(this.getMapTypeElement(oldMapTypeIndex),
            'mapType-selected');
        oldMapType = this.getCurrentMapType();
        array.forEach(oldMapType.layers, function (layer) {
          layer.hide();
        });
      }

      this.setCurrentMapType(index);

      mapType = this.mapTypes[index];
      array.forEach(mapType.layers, function (layer) {
        layer.show();
      });

      this.emit('mapTypeChanged', mapType.label);
    },

    getMapTypeElement : function (index) {
      return this._mapTypeElements[index];
    },

    getCurrentMapType : function () {
      return this.mapTypes[this._currentMapTypeIndex];
    },

    getCurrentMapTypeIndex : function () {
      return this._currentMapTypeIndex;
    },

    _createGallery : function () {
      var _this;

      _this = this;

      array.forEach(this.mapTypes, function (mapType, index) {
        var templateString;

        templateString = lang.replace(mapTypeGalleryItemTemplate, {
          name : mapType.label,
          id   : 'mapType-gallery-item-' + index,
          url  : mapType.thumbnail
        });

        domConstruct.create(domConstruct.toDom(templateString), null, _this.domNode); 
      });
    }
  });
});
