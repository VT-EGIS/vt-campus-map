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
], function(declare, query, touch, topic,dom, _WidgetBase, _TemplatedMixin, template) {
  return declare([_WidgetBase, _TemplatedMixin], {
      templateString: template,

      postCreate: function() {
        this.inherited(arguments);
        this._attachEventHandlers();
      },

      _attachEventHandlers: function() {
        var _this = this;
        
        // show Category modal
        query('a[href="#categories"]', this.domNode).on(touch.press, function(e) {
          e.preventDefault();
          query('.categories-modal').modal('show');;
          _this._hideDropdownNav(e);
		  /*dom.byId("categoryItemsList").innerHTML = "";
		  dom.byId("categoryItemsList").style.display = "none";
		  selectElem = query('#categoriesSelect');
		  selectElem.val("Select Category");*/
        });
		
		// show about modal
        query('a[href="#about"]', this.domNode).on(touch.press, function(e) {
          e.preventDefault();
          query('.about-modal').modal('show');;
          _this._hideDropdownNav(e);
        });
		
      },

      _hideDropdownNav: function(e) {
        // hide nav dropdown on mobile
        if (query('.navbar-collapse.in', this.domNode).length > 0) {
          //e.stopPropagation();
          query('.navbar-toggle', this.domNode)[0].click();
        }
      }
   });
});