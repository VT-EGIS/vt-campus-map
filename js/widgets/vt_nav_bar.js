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
      
      query('#search-by-category', this.domNode).on(touch.press, function() {
        query('#search-by-category-modal').modal('show');
        _this._hideDropdownNav();
      });
  
      query('a[href="#about"]', this.domNode).on(touch.press, function() {
        query('#about-modal').modal('show');
        _this._hideDropdownNav();
      });

      query('#search-by-name', this.domNode).on(touch.press, function() {
        query('#search-by-name-modal').modal('show');
        _this._hideDropdownNav();
      });
    },

    _hideDropdownNav: function() {
      if (query('.navbar-collapse.in', this.domNode).length > 0) {
        query('.navbar-toggle', this.domNode)[0].click();
      }
    }
  });
});
