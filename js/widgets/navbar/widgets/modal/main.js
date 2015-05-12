define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./template.html',
  'dojo/html',
  'dojo/query'
], function (declare, _WidgetBase, _TemplatedMixin, template, html, query) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function () {
      this.title = query('.modal-title', this.domNode)[0];
      this.body = query('.modal-body', this.domNode)[0];
    },
    
    setTitle: function (value) {
      html.set(this.title, value);
    },

    setBody: function (value) {
      html.set(this.body, value);
    }
  });
});
