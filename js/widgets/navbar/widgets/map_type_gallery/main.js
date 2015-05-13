define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/on',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-class',
  'dojo/text!./template.html',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'dojo/Evented'
], function (declare, _WidgetBase, domConstruct, query, on, lang, array,
             domClass, mapTypeGalleryItemTemplate,
             ArcGISDynamicMapServiceLayer, Evented) {
  return declare([_WidgetBase, Evented], {

    constructor : function () {
      this.currentMapTypeIndex = -1;
      this.mapTypeElements = [];
    },

    postMixInProperties: function () {
      this.loadMapTypes();
    },

    postCreate: function() {
      this.createGallery();
      this.attachEventHandlers();
      this.selectMapType(this.defaultMapTypeIndex);
    },

    loadMapTypes : function () {
      array.forEach(this.mapTypes, lang.hitch(this, function(mapType) {
        mapType.layers = array.map(mapType.layerUrls, lang.hitch(this, function (url) {
          var serviceLayer;

          serviceLayer = new ArcGISDynamicMapServiceLayer(url);
          serviceLayer.hide();
          this.map.addLayer(serviceLayer, 1);

          return serviceLayer;
        }));
      }));
    },

    attachEventHandlers : function () {
      on(this.domNode, 'img:click', lang.hitch(this, function (evt) {
        var id, index;

        evt.preventDefault();
        id = evt.target.id;
        index = id[id.length - 1];
        this.selectMapType(index);
      }));
    },

    selectMapType : function (index) {
      var oldMapType, oldMapTypeIndex, mapType;

      oldMapTypeIndex = this.currentMapTypeIndex;

      if(oldMapTypeIndex === index) { return; }

      if(oldMapTypeIndex !== -1) {
        domClass.remove(this.mapTypeElements[oldMapTypeIndex], 'mapType-selected');
        oldMapType = this.mapTypes[this.currentMapTypeIndex];
        array.forEach(oldMapType.layers, function (layer) { layer.hide(); });
      }

      this.currentMapTypeIndex = index;
      domClass.add(this.mapTypeElements[index], 'mapType-selected');

      mapType = this.mapTypes[index];
      array.forEach(mapType.layers, function (layer) { layer.show(); });

      this.emit('mapTypeChanged', mapType.label);
    },

    createGallery : function () {
      array.forEach(this.mapTypes, lang.hitch(this, function (mapType, index) {
        var templateString;

        templateString = lang.replace(mapTypeGalleryItemTemplate, {
          name : mapType.label,
          id   : 'mapType-gallery-item-' + index,
          url  : mapType.thumbnail
        });

        domConstruct.place(domConstruct.toDom(templateString), this.domNode); 
      }));

      this.mapTypeElements = query('li', this.domNode);
    }
  });
});
