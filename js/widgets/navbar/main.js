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
  './widgets/layers_modal/main',
  'dojo/query',
  'dojo/_base/lang',
  'dojo/dom-style',
  './widgets/search_by_name/main',
  './widgets/search_by_category/main',
  'vtCampusMap/google_analytics_manager',
  'vtCampusMap/widgets/place_identifier/main',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function (declare, _WidgetBase, _TemplatedMixin, template, MapTypeGallery,
             config, LegendModal, AboutModal, FeaturedPlaceWidget, FeaturedPlacesModal,
             LayersModal, query, lang, domStyle, SearchByNameWidget, SearchByCategoryWidget,
             ga, PlaceIdentifier) {
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
      var searchByNameWidget;

      searchByNameWidget = new SearchByNameWidget({ placeIdentifier: this.placeIdentifier });

      this.domNode.appendChild(searchByNameWidget.domNode);

      query('#search-by-name', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        searchByNameWidget.open();
        this.hideDropdownNavbar();
      }));

      query('#searchField', this.domNode).on('click', function (evt) {
        evt.preventDefault();
        searchByNameWidget.open();
      });
    },

    addSearchByCategoryWidget: function () {
      var searchByCategoryWidget;

      searchByCategoryWidget = new SearchByCategoryWidget({
        map: this.map,
        placeIdentifier: this.placeIdentifier,
        id: 'search-by-category-modal'
      });

      this.domNode.appendChild(searchByCategoryWidget.domNode);

      query('#search-by-category', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        searchByCategoryWidget.open();
        this.hideDropdownNavbar();
      }));
    },

    addLayersModal: function () {
      var layersModal;

      layersModal = new LayersModal({ layers: this.layers, id: 'layers-modal' });

      this.domNode.appendChild(layersModal.domNode);

      query('#layers-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        layersModal.open();
        this.hideDropdownNavbar();
      }));
    },

    addFeaturedPlaceWidget: function () {
      var featuredPlacesModal;

      if(this.isMobile()) {
        featuredPlacesModal = new FeaturedPlacesModal({
          featuredPlaces: config.featuredPlaces,
          placeIdentifier: this.placeIdentifier
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
          placeIdentifier: this.placeIdentifier
        }, 'featured-places');
      }
    },

    addMapTypeGallery: function () {
      var gallery;

      gallery = new MapTypeGallery({
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
        ga.report(ga.actions.SEL_LEGEND);
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
    }
  });
});
