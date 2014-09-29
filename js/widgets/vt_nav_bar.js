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
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function(declare, query, touch, _WidgetBase, _TemplatedMixin, template, ga,
            mapTypeGallery, lang, domStyle, Bookmarks) {
  return declare([_WidgetBase, _TemplatedMixin], {
    constructor : function (opts) {
      lang.mixin(this, opts);
    },

    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      this._attachEventHandlers();
      this._addWidgets();
      this._setUpGoogleAnalyticTrackers();
    },

    _addWidgets : function () {
      this._addMapTypeGallery();
      this._addBookmarkWidgets();
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

    _setUpGoogleAnalyticTrackers : function () {
      var send, evt, touchAct, dropdown;

      send = ga.getCst('SEND');
      evt  = ga.getCst('EVENT');
      touchAct = ga.getAct('TOUCH');
      dropdown = ga.getLbl('NAV_DROPDOWN');

      query('#map-type-nav.dropdown-toggle', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('MAP_TYPE'), touchAct, dropdown);
        });
      query('#find-places-nav.dropdown-toggle', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('FIND_PLACES'), touchAct, dropdown);
        });
      query('#featured-nav.dropdown-toggle', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('FEATURED'), touchAct, dropdown);
        });
      query('#legend-nav.dropdown-toggle', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('LEGEND'), touchAct, dropdown);
        });
      query('#layers-nav.dropdown-toggle', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('LEGEND'), touchAct, dropdown);
        });
      query('#about-nav', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('ABOUT'), touchAct, dropdown);
        });
      query('#search-by-category', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('SEARCH_CATEGORY'), touchAct, dropdown);
        });
      query('#search-by-name', this.domNode)
        .on(touch.press, function () {
          __gaTracker(send, evt, ga.getCat('SEARCH_NAME'), touchAct, dropdown);
        });
    },

    _addMapTypeGallery : function () {

      new mapTypeGallery({
        mapTypes: this.mapTypes,
        map: this.map,
        defaultMapTypeIndex: 0,
        onSelectHandler: lang.hitch(this, this._hideDropdownNav)
      }, 'mapType-gallery');
    },

    _addBookmarkWidgets : function () {
      // The Normal Dropdown visible on larger screens
      new Bookmarks({
        bookmarks      : this.featuredPlaces,
        onClickHandler : this.onClickHandler,
        attrs          : {
          'class' : 'vt-background-color'
        }
      }, 'featured-bookmarks');

      // The Mobile Modal
      new Bookmarks({
        bookmarks      : this.featuredPlaces,
        onClickHandler : this.onClickHandler,
      }, 'featured-bookmarks-modal-content');
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
