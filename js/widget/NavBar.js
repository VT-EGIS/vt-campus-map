define([
  'dojo/_base/declare',
  'dojo/query',
  'dojo/touch',
  'dojo/topic',
  'dojo/dom',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/NavBar.html',
  'bootstrap/Collapse',
  'bootstrap/Dropdown',
  'bootstrap/Modal'
], function(declare, query, touch, topic,dom, _WidgetBase,
            _TemplatedMixin, template) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function() {
      this.inherited(arguments);
      this._attachEventHandlers();
    },

    _attachEventHandlers: function() {
      var _this = this;
      
      query('a[href="#categories"]', this.domNode).on(touch.press, function(e) {
        e.preventDefault();
        query('.categories-modal').modal('show');
        _this._hideDropdownNav(e);
      });
  
      query('a[href="#about"]', this.domNode).on(touch.press, function(e) {
        e.preventDefault();
        query('.about-modal').modal('show');
        _this._hideDropdownNav(e);
      });
    },

    _hideDropdownNav: function(e) {
      if (query('.navbar-collapse.in', this.domNode).length > 0) {
        query('.navbar-toggle', this.domNode)[0].click();
      }
    }
  });
});
