define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/on',
  'dojo/_base/lang',
  'dojo/text!./templates/maptype_gallery_item.html'
], function (declare, _WidgetBase, domConstruct, query, on, lang,
             mapTypeGalleryItemTemplate) {
  return declare([_WidgetBase], {
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

      dojo.forEach(this.mapTypes, function(mapType) {
        mapType.layers = dojo.map(mapType.layerInfos, function(layerInfo) {
          var serviceLayer;

          serviceLayer = layerInfo.load();
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
      dojo.addClass(this._mapTypeElements[index], 'mapType-selected');
    },

    selectMapType : function (index) {
      var map, oldMapType, oldMapTypeIndex, mapType;

      map = this.getMap();
      oldMapTypeIndex = this.getCurrentMapTypeIndex();

      if(oldMapTypeIndex === index) {
        return;
      }

      if(oldMapTypeIndex !== -1) {
        dojo.removeClass(this.getMapTypeElement(oldMapTypeIndex),
            'mapType-selected');
        oldMapType = this.getCurrentMapType();
        dojo.forEach(oldMapType.layers, function (layer) {
          layer.hide();
        });
      }

      this.setCurrentMapType(index);

      mapType = this.mapTypes[index];
      dojo.forEach(mapType.layers, function (layer) {
        layer.show();
      });
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

      dojo.forEach(this.mapTypes, function (mapType, index) {
        var templateString;

        templateString = dojo.replace(mapTypeGalleryItemTemplate, {
          name : mapType.label,
          id   : 'mapType-gallery-item-' + index,
          url  : mapType.thumbnail
        });

        dojo.create(domConstruct.toDom(templateString), null, _this.domNode); 
      });
    }
  });
});
