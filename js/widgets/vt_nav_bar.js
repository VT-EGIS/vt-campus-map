define([
  'dojo/_base/declare',
  'dojo/query',
  'dojo/touch',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/vt_nav_bar.html',
  'app/google_analytics_constants',
  'app/widgets/map_type',
  'dojo/_base/lang',
  'dojo/dom-style',
  'app/widgets/bookmarks',
  'app/widgets/search_by_category',
  'app/widgets/search_by_name',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function(declare, query, touch, _WidgetBase, _TemplatedMixin, template, ga,
            mapTypeGallery, lang, domStyle, Bookmarks, SearchByCategoryWidget,
            SearchByNameWidget) {
  return declare([_WidgetBase, _TemplatedMixin], {
    constructor : function (opts) {
      lang.mixin(this, opts);
    },

    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      this._attachEventHandlers();
      this._addWidgets();
    },

    _addWidgets : function () {
      this._addMapTypeGallery();
      this._addBookmarkWidgets();
      this._addSearchByCategoryWidget();
      this._addSearchByNameWidget();
    },

    _attachEventHandlers: function() {
      var _this = this;
      
      query('#search-by-category', this.domNode).on(touch.press, function() {
        query('#search-by-category-modal').modal('show');
        _this._hideDropdownNav();
      });
  
      query('#about-nav', this.domNode).on(touch.press, function () {
        query('#about-modal').modal('show');
        _this._hideDropdownNav();
      });

      query('#legend-nav', this.domNode).on(touch.press, function () {
        query('#legend-modal').modal('show');
        _this._hideDropdownNav();
      });

      query('#layers-nav', this.domNode).on(touch.press, function () {
        query('#layers-modal').modal('show');
        _this._hideDropdownNav();
      });

      // XXX For some reason, registering on the touch.press event
      // does not close the main dropdown when 'enter' is used to
      // select the place. So, we're using touch.release
      query('#search-by-name', this.domNode).on(touch.release, function () {
        query('#search-by-name-modal').modal('show');
        _this._hideDropdownNav();
      });

      if(this._isMobile()) {
        query('#featured-nav', this.domNode).on(touch.press, function () {
          query('#featured-bookmarks-modal').modal('show');
          _this._hideDropdownNav();
        });
      }

      query('#searchField', this.domNode).on(touch.press, function () {
        query('#search-by-name-modal').modal('show');
      });
    },

    _hideDropdownNav: function() {
      if (query('.navbar-collapse.in', this.domNode).length > 0) {
        query('.navbar-toggle', this.domNode)[0].click();
      }
    },

    _addMapTypeGallery : function () {
      var gallery;

      gallery = new mapTypeGallery({
        mapTypes: this.mapTypes,
        map: this.map,
        defaultMapTypeIndex: 0,
        onSelectHandler: lang.hitch(this, this._hideDropdownNav)
      }, 'mapType-gallery');

      gallery.on('mapTypeChanged', function (label) {
        __gaTracker(ga.getCst('SEND'), ga.getCst('EVENT'),
            ga.getCat('MAP_VIEW_CTL'), ga.getAct('SEL_MAP_TYPE'), label);
      });
    },

    _addBookmarkWidgets : function () {
      var bookmarkDropDown, bookmarkModal;

      // The Normal Dropdown visible on larger screens
      bookmarkDropDown = new Bookmarks({
        bookmarks      : this.featuredPlaces,
        onClickHandler : this.onClickHandler,
        attrs          : {
          'class' : 'vt-background-color'
        }
      }, 'featured-bookmarks');

      bookmarkDropDown.on('bookmarkSelected', function (bookmarkName) {
        __gaTracker(ga.getCst('SEND'), ga.getCst('EVENT'),
            ga.getCat('MAP_OBJ_SEL'), ga.getAct('SEL_FEATURED_PLACE'), bookmarkName);
      });

      // The Mobile Modal
      bookmarkModal = new Bookmarks({
        bookmarks      : this.featuredPlaces,
        onClickHandler : this.onClickHandler,
      }, 'featured-bookmarks-modal-content');

      bookmarkModal.on('bookmarkSelected', function (bookmarkName) {
        __gaTracker(ga.getCst('SEND'), ga.getCst('EVENT'),
            ga.getCat('MAP_OBJ_SEL'), ga.getAct('SEL_FEATURED_PLACE'), bookmarkName);
      });

    },

    _addSearchByCategoryWidget : function () {
      var searchByCategoryWidget;

      searchByCategoryWidget = new SearchByCategoryWidget({
        onClickHandler : this.onClickHandler,
        gazeteerLayer  : this.gazeteerLayer
      }, 'search-by-category-modal');

      searchByCategoryWidget.on('categorySelected', function (categoryName) {
        __gaTracker(ga.getCst('SEND'), ga.getCst('EVENT'),
            ga.getCat('MAP_OBJ_SEL'), ga.getAct('SEL_SEARCHCAT_CAT'), categoryName);
      });
      searchByCategoryWidget.on('placeSelected', function (placeName) {
        __gaTracker(ga.getCst('SEND'), ga.getCst('EVENT'),
            ga.getCat('MAP_OBJ_SEL'), ga.getAct('SEL_SEARCHCAT_PLACE'), placeName);
      });
    },

    _addSearchByNameWidget : function () {
      var searchByNameWidget;
      
      searchByNameWidget = new SearchByNameWidget({
        onClickHandler : this.onClickHandler,
        gazeteerLayer  : this.gazeteerLayer,
      }, 'search-by-name-modal');

      searchByNameWidget.on('placeSelected', function (placeName) {
        __gaTracker(ga.getCst('SEND'), ga.getCst('EVENT'),
            ga.getCat('MAP_OBJ_SEL'), ga.getAct('SEL_SEARCHNAME_PLACE'), placeName);
      });
    }, 

    // NOTE: This is a hack/workaround and is dependent on the fact
    // that we use a bootstrap navbar that has atleast one
    // button in it which is visible on smaller screens only
    _isMobile : function () {
      var mobileMenuButton;
      mobileMenuButton = query('.navbar-header button')[0];
      return domStyle.get(mobileMenuButton, 'display') !== 'none';
    }
  });
});
