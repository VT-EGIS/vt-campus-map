define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./template.html',
  './widgets/map_type_gallery/main',
  'vtCampusMap/config',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown'
], function (declare, _WidgetBase, _TemplatedMixin, template, MapTypeGallery, config) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function () {
      this.addWidgets();
    },

    addWidgets: function () {
      this.addMapTypeGallery();
    },

    addMapTypeGallery: function () {
      var gallery;

      gallery = new MapTypeGallery({
        mapTypes: config.mapTypes,
        map: this.map,
        defaultMapTypeIndex: 0,
      }, 'mapType-gallery')
    }
  });
});
