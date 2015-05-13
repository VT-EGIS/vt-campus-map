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
  './widgets/featured_places_modal/main',
  'dojo/query',
  'dojo/_base/lang',
  'dojo/dom-style',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function (declare, _WidgetBase, _TemplatedMixin, template, MapTypeGallery,
             config, LegendModal, AboutModal, FeaturedPlaceWidget, FeaturedPlacesModal,
             query, lang, domStyle) {
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
      var featuredPlacesModal;

      if(this.isMobile()) {
        featuredPlacesModal = new FeaturedPlacesModal({
          featuredPlaces: config.featuredPlaces,
          map: this.map,
          markerSymbol: this.markerSymbol
        }); 
        this.domNode.appendChild(featuredPlacesModal.domNode);

        query('#featured-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
          evt.preventDefault();
          featuredPlacesModal.open();
          this.hideDropdownNavbar();
        }));
      } else {
        new FeaturedPlaceWidget({
          featuredPlaces: config.featuredPlaces,
          map: this.map,
          markerSymbol: this.markerSymbol
        }, 'featured-places');
      }
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
    },

    isMobile: function () {
      var mobileMenuButton;

      mobileMenuButton = query('.navbar-header button')[0];
      return domStyle.get(mobileMenuButton, 'display') !== 'none';
    }
  });
});
