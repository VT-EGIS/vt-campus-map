define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./template.html',
  './widgets/map_type_gallery/main',
  'vtCampusMap/config',
  './widgets/legend/main',
  'dojo/query',
  'dojo/_base/lang',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function (declare, _WidgetBase, _TemplatedMixin, template, MapTypeGallery,
             config, LegendModal, query, lang) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function () {
      this.addWidgets();
    },

    addWidgets: function () {
      this.addMapTypeGallery();
      this.addLegendModal();
    },

    addMapTypeGallery: function () {
      new MapTypeGallery({
        mapTypes: config.mapTypes,
        map: this.map,
        defaultMapTypeIndex: 0,
      }, 'mapType-gallery');
    },

    addLegendModal: function () {
      var legendModal, nodeList;

      legendModal = new LegendModal({
        map: this.map,
        layerInfos: this.layerInfos
      });
      nodeList = query(legendModal.domNode);

      this.domNode.appendChild(legendModal.domNode);

      legendModal.startup();

      query('#legend-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        nodeList.modal('show');
        this.hideDropdownNavbar();
      }));
    },

    hideDropdownNavbar: function () {
      if (query('.navbar-collapse.in', this.domNode).length > 0) {
        query('.navbar-toggle', this.domNode)[0].click();
      }
    }
  });
});
