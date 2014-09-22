define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/search_by_name_modal.html'
], function (declare, _WidgetBase, _TemplatedMixin, modal) {
  return declare([_WidgetBase, _TemplatedMixin], {
    constructor : function (opts, elementId) {
    },
    
    templateString : modalTemplate,

    postCreate : function () {
    },

    _attachEventHandlers : function () {
    }
  }); 
});
