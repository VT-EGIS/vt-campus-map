define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/on',
  'dojo/text!./templates/basemap_gallery_item.html'
], function (declare, _WidgetBase, domConstruct, query, on, basemapGalleryItemTemplate) {
  return declare([_WidgetBase], {
    constructor : function (opts, elementID) {
      this._elementID = elementID;
      this._currentBasemapIndex = -1;
      this._basemapElements = [];
      this._copyProperties(opts, this);
      this._loadBasemaps();
      this._createGallery();
    },

    attrs : {
      'class' : 'dropdown-menu vt-background-color',
      'role'  : 'menu',
    },

    postCreate: function() {
      this.inherited(arguments);
      this._getGalleryElements();
      this._attachEventHandlers();
      this.selectBasemap(this.defaultBasemapIndex);
    },

    _getGalleryElements : function () {
      this._basemapElements = query('li', this.domNode);
    },

    _copyProperties : function (configItem) {
      for(var property in configItem) {
        if(configItem.hasOwnProperty(property)) {
          this[property] = configItem[property];
        }
      }
    },

    _loadBasemaps : function () {
      var _this, map;

      _this = this;
      map = this.getMap();

      dojo.forEach(this.basemaps, function(basemap) {
        basemap.layers = dojo.map(basemap.layerInfos, function(layerInfo) {
          var serviceLayer;

          serviceLayer = layerInfo.load();
          serviceLayer.hide();
          map.addLayer(serviceLayer, 1);

          return serviceLayer;
        });
      });
    },

    _attachEventHandlers : function () {
      var dropDownListElement, _this;

      _this = this;

      dropDownListElement = query('.dropdown-menu', this.domNode);

      on(dropDownListElement, 'img:click', function (evt) {
        var id, index;

        id = evt.target.id;
        index = id[id.length - 1];

        _this.selectBasemap(index);
      });
    },

    getMap : function () {
      return this.map;
    },

    setCurrentBasemap : function(index) {
      this._currentBasemapIndex = index;
      dojo.addClass(this._basemapElements[index], 'basemap-gallery-selected');
    },

    selectBasemap : function (index) {
      var map, oldBasemap, oldBasemapIndex, basemap;

      map = this.getMap();
      oldBasemapIndex = this.getCurrentBasemapIndex();

      if(oldBasemapIndex === index) {
        return;
      }

      if(oldBasemapIndex !== -1) {
        dojo.removeClass(this.getBasemapElement(oldBasemapIndex),
            'basemap-gallery-selected');
        oldBasemap = this.getCurrentBasemap();
        dojo.forEach(oldBasemap.layers, function (layer) {
          layer.hide();
        });
      }

      this.setCurrentBasemap(index);

      basemap = this.basemaps[index];
      dojo.forEach(basemap.layers, function (layer) {
        layer.show();
      });
    },

    getBasemapElement : function (index) {
      return this._basemapElements[index];
    },

    getCurrentBasemap : function () {
      return this.basemaps[this._currentBasemapIndex];
    },

    getCurrentBasemapIndex : function () {
      return this._currentBasemapIndex;
    },

    _createGallery : function () {
      var dropdownList, _this;

      dropdownList = dojo.create('ul', this.attrs, this._elementID);

      _this = this;

      dojo.forEach(this.basemaps, function (basemap, index) {
        var templateString;

        templateString = dojo.replace(basemapGalleryItemTemplate, {
          name : basemap.label,
          id   : "basemap-gallery-item-" + index,
          url  : basemap.thumbnail
        });

        dojo.create(domConstruct.toDom(templateString), null, dropdownList); 
      });
    }
  });
});
