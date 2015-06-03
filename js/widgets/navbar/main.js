define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./template.html',
  './widgets/map_type_gallery/main',
  'vtCampusMap/config',
  './widgets/about/main',
  './widgets/featured_places/main',
  'layersWidget',
  'dojo/query',
  'dojo/_base/lang',
  'dojo/dom-style',
  './widgets/search_by_name/main',
  './widgets/search_by_category/main',
  'vtCampusMap/google_analytics_manager',
  'vtCampusMap/widgets/place_identifier/main',
  './widgets/modal/main',
  'esri/dijit/Legend',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function (declare, _WidgetBase, _TemplatedMixin, template, MapTypeGallery,
             config, AboutModal, FeaturedPlaceWidget, Layers,
             query, lang, domStyle, SearchByNameWidget, SearchByCategoryWidget,
             ga, PlaceIdentifier, Modal, Legend) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postMixInProperties: function () {
      this.imageUrl = require.toUrl('./imgs/VT-Logo.png');
    },

    postCreate: function () {
      this.addWidgets();
    },

    addWidgets: function () {
      this.placeIdentifier = new PlaceIdentifier({
        map: this.map,
        markerSymbol: this.markerSymbol,
        borderSymbol: this.borderSymbol,
        layerId: 'Buildings'
      }); 
      this.addMapTypeGallery();
      this.addLegendModal();
      this.addAboutModal();
      this.addFeaturedPlaceWidget();
      this.addLayersModal();
      this.addSearchByNameWidget();
      this.addSearchByCategoryWidget();
    },

    addSearchByNameWidget: function () {
      this.searchByNameWidget = new SearchByNameWidget({
        placeIdentifier: this.placeIdentifier,
        id: 'search-by-name-modal'
      });

      this.domNode.appendChild(this.searchByNameWidget.domNode);

      query('#search-by-name', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.searchByNameWidget.open();
        this.hideDropdownNavbar();
      }));

      query('#searchField', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.searchByNameWidget.open();
      }));
    },

    addSearchByCategoryWidget: function () {
      this.searchByCategoryWidget = new SearchByCategoryWidget({
        gazeteerLayerUrl: config.gazeteerLayerUrl,
        placeIdentifier: this.placeIdentifier,
        spatialReference: config.spatialReference,
        id: 'search-by-category-modal'
      });

      this.domNode.appendChild(this.searchByCategoryWidget.domNode);

      query('#search-by-category', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.searchByCategoryWidget.open();
        this.hideDropdownNavbar();
      }));
    },

    addLayersModal: function () {
      this.layersModal = new Modal({ id: 'layers-modal' });
      this.layersModal.setTitle('Layers');

      this.domNode.appendChild(this.layersModal.domNode);

      this.layersWidget = new Layers({
        layers: this.layers,
        'class': 'layers-list'
      }, this.layersModal.getBody());

      query('#layers-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.layersModal.open();
        this.hideDropdownNavbar();
      }));
    },

    addFeaturedPlaceWidget: function () {
      var elt;

      elt = 'featured-places';
      if(this.isMobile()) {
        this.featuredPlacesModal = new Modal({ id: 'featured-places-modal' }); 
        this.featuredPlacesModal.setTitle('Featured Places');
        this.domNode.appendChild(this.featuredPlacesModal.domNode);
        elt = this.featuredPlacesModal.getBody();

        query('#featured-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
          evt.preventDefault();
          this.featuredPlacesModal.open();
          this.hideDropdownNavbar();
        }));
      }
      this.featuredPlaces = new FeaturedPlaceWidget({
        featuredPlaces: config.featuredPlaces,
        placeIdentifier: this.placeIdentifier
      }, elt);
    },

    addMapTypeGallery: function () {
      this.gallery = new MapTypeGallery({
        mapTypes: config.mapTypes,
        map: this.map,
        defaultMapTypeIndex: 0,
      }, 'mapType-gallery');
    },

    addLegendModal: function () {
      this.legendModal = new Modal({ id: 'legend-modal' });
      this.legendModal.setTitle('Legend');

      this.domNode.appendChild(this.legendModal.domNode);

      this.legend = new Legend({
        map: this.map,
        layerInfos: this.layerInfos,
        id: 'legend'
      }, this.legendModal.getBody());

      this.legend.startup();

      query('#legend-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.legendModal.open();
        this.hideDropdownNavbar();
        ga.report(ga.actions.SEL_LEGEND);
      }));
    },

    addAboutModal: function () {
      this.aboutModal = new AboutModal({ id: 'about-modal' });
      this.domNode.appendChild(this.aboutModal.domNode);

      query('#about-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.aboutModal.open();
        this.hideDropdownNavbar();
        ga.report(ga.actions.SEL_ABOUT);
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
    },

    destroy: function () {
      this.gallery && this.gallery.destroy();
      this.legendModal && this.legendModal.destroy();
      this.legend && this.legend.destroy();
      this.aboutModal && this.aboutModal.destroy();
      this.featuredPlaces && this.featuredPlaces.destroy();
      this.featuredPlacesModal && this.featuredPlacesModal.destroy();
      this.layersModal && this.layersModal.destroy();
      this.searchByCategoryWidget && this.searchByCategoryWidget.destroy();
      this.searchByNameWidget && this.searchByNameWidget.destroy();
      this.inherited(arguments);
    }
  });
});
