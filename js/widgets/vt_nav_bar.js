define([
  'dojo/_base/declare',
  'dojo/query',
  'dojo/touch',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/vt_nav_bar.html',
  'app/google_analytics_constants',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function(declare, query, touch, _WidgetBase, _TemplatedMixin, template, ga) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      this._attachEventHandlers();
      this._setUpGoogleAnalyticTrackers();
    },

    _attachEventHandlers: function() {
      var _this = this;
      
      query('#search-by-category', this.domNode).on(touch.press, function(e) {
        query('#search-by-category-modal').modal('show');
        _this._hideDropdownNav(e);
      });
  
      query('a[href="#about"]', this.domNode).on(touch.press, function(e) {
        query('#about-modal').modal('show');
        _this._hideDropdownNav(e);
      });

      query('#search-by-name', this.domNode).on(touch.press, function(e) {
        query('#search-by-name-modal').modal('show');
        _this._hideDropdownNav(e);
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
    }
  });
});
