define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./template.html',
  'dojo/text!./about.html',
  'mapTypeGalleryWidget',
  'vtCampusMap/config',
  'featuredPlacesWidget',
  'layersWidget',
  'dojo/query',
  'dojo/_base/lang',
  'dojo/dom-style',
  './widgets/search_by_name/main',
  './widgets/search_by_category/main',
  'vtCampusMap/vt_campus_map_rpts',
  'vtCampusMap/widgets/place_identifier/main',
  './widgets/modal/main',
  'esri/dijit/Legend',
  'esri/geometry/Point',
  'esri/geometry/webMercatorUtils',
  'dojo/dom-class',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function (declare, _WidgetBase, _TemplatedMixin, template, aboutContent, MapTypeGallery,
             config, FeaturedPlaceWidget, Layers,
             query, lang, domStyle, SearchByNameWidget, SearchByCategoryWidget,
             ga, PlaceIdentifier, Modal, Legend, Point, webMercatorUtils, domClass) {
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
        gazeteerLayerUrl: config.gazeteerLayerUrl,
        id: 'search-by-name-modal',
        unmoveable: true
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
        id: 'search-by-category-modal',
        unmoveable: true
      });

      this.domNode.appendChild(this.searchByCategoryWidget.domNode);

      query('#search-by-category', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.searchByCategoryWidget.open();
        this.hideDropdownNavbar();
      }));
    },

    addLayersModal: function () {
      this.layersModal = new Modal({
        id: 'layers-modal',
        unmoveable: true
      });
      this.layersModal.setTitle('Layers');

      this.domNode.appendChild(this.layersModal.domNode);

      this.layersWidget = new Layers({
        layers: this.layers,
        'class': 'layers-list',
        onLayerOn: function (name) {
          ga.report(ga.actions.TURNON_LAYER, name);
        },
        onLayerOff: function (name) {
          ga.report(ga.actions.TURNOFF_LAYER, name);
        },
      }, this.layersModal.getBody());

      query('#layers-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
        evt.preventDefault();
        this.layersModal.open();
        this.hideDropdownNavbar();
      }));
    },

    addFeaturedPlaceWidget: function () {
      var elt, point, place;

      elt = 'featured-places';

      for(var name in config.featuredPlaces) {
        place = config.featuredPlaces[name];
        point = new Point(place.geometry.lng, place.geometry.lat);
        place.mercatorGeometry = webMercatorUtils.geographicToWebMercator(point);
      }

      if(this.isMobile()) {
        this.featuredPlacesModal = new Modal({
          id: 'featured-places-modal',
          unmoveable: true
        }); 
        this.featuredPlacesModal.setTitle('Featured Places');
        this.domNode.appendChild(this.featuredPlacesModal.domNode);
        elt = this.featuredPlacesModal.getBody();

        query('#featured-nav', this.domNode).on('click', lang.hitch(this, function (evt) {
          evt.preventDefault();
          this.featuredPlacesModal.open();
          this.hideDropdownNavbar();
        }));
        this.featuredPlaces = new FeaturedPlaceWidget({
          featuredPlaces: config.featuredPlaces,
          itemOpts: { 'data-dismiss': 'modal' }
        }, elt);
      } else {
        this.featuredPlaces = new FeaturedPlaceWidget({
          featuredPlaces: config.featuredPlaces,
          class: 'dropdown-menu vt-background-color'
        }, elt);
      }

      this.featuredPlaces.on('place-selected', lang.hitch(this, function (name) {
        this.placeIdentifier.identify(config.featuredPlaces[name].mercatorGeometry);
        ga.report(ga.actions.SEL_FEATURED_PLACE, name);
      }));
    },

    addMapTypeGallery: function () {
      this.gallery = new MapTypeGallery({
        mapTypes: config.mapTypes,
        map: this.map,
        defaultMapTypeIndex: 0,
        'class': 'list-unstyled row'
      }, 'mapType-gallery');
      query('#mapType-gallery li').forEach(function (li) {
        domClass.add(li, 'col-md-12 col-xs-6');
      });
      query('#mapType-gallery img').forEach(function (img) {
        domClass.add(img, 'img-thumbnail');
      });
      this.gallery.on('basemap-changed', function (name) {
        ga.report(ga.actions.SEL_MAP_TYPE, name);
      });
    },

    addLegendModal: function () {
      this.legendModal = new Modal({
        id: 'legend-modal',
        unmoveable: true
      });
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
      this.aboutModal = new Modal({
        id: 'about-modal',
        unmoveable: true
      });
      this.aboutModal.setTitle('About');
      this.aboutModal.setBody(aboutContent); 
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
