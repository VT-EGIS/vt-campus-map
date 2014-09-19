define([
  'dojo/_base/declare',
  'dojo/query',
  'dojo/touch',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/vt_nav_bar.html',
  'dojoBootstrap/Collapse',
  'dojoBootstrap/Dropdown',
  'dojoBootstrap/Modal'
], function(declare, query, touch, _WidgetBase, _TemplatedMixin, template) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      this._attachEventHandlers();
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
    }
  });
});
