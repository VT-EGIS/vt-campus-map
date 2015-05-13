define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./template.html',
  './widgets/map_type_gallery/main',
  'vtCampusMap/config',
  './widgets/legend/main',
  './widgets/about/main',
  './widgets/featured_places/main',
  'dojo/query',
  'dojo/_base/lang',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function (declare, _WidgetBase, _TemplatedMixin, template, MapTypeGallery,
             config, LegendModal, AboutModal, FeaturedPlaceWidget, query, lang) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function () {
      this.addWidgets();
    },

    addWidgets: function () {
      this.addMapTypeGallery();
      this.addLegendModal();
      this.addAboutModal();
      this.addFeaturedPlaceWidget();
    },

    addFeaturedPlaceWidget: function () {
      new FeaturedPlaceWidget({
        featuredPlaces: config.featuredPlaces,
        map: this.map,
        markerSymbol: this.markerSymbol
      }, 'featured-places');
    },

    addMapTypeGallery: function () {
      new MapTypeGallery({
        mapTypes: config.mapTypes,
        map: this.map,
        defaultMapTypeIndex: 0,
      }, 'mapType-gallery');
    },

    addLegendModal: function () {
      var legendModal;

      legendModal = new LegendModal({
        map: this.map,
        layerInfos: this.layerInfos
      });

      this.domNode.appendChild(legendModal.domNode);

      legendModal.startup();

      query('#legend-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        legendModal.open();
        this.hideDropdownNavbar();
      }));
    },

    addAboutModal: function () {
      var aboutModal;

      aboutModal = new AboutModal();
      this.domNode.appendChild(aboutModal.domNode);

      query('#about-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        aboutModal.open();
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
