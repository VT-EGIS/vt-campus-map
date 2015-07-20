define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./template.html',
  'dojo/html',
  'dojo/query',
  'dojo/dnd/Moveable',
  'dojoBootstrap/Modal'
], function (declare, _WidgetBase, _TemplatedMixin, template, html, query,
             Moveable) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    postCreate: function () {
      this.title = query('.modal-title', this.domNode)[0];
      this.body = query('.modal-body', this.domNode)[0];
      this.nodeList = query(this.domNode);
      this.modal = this.nodeList.modal({
        show: false,
        backdrop: false 
      });
      if(!this.unmoveable) {
        new Moveable(this.domNode);
      }
    },
    
    setTitle: function (value) {
      html.set(this.title, value);
    },

    setBody: function (value) {
      html.set(this.body, value);
    },

    getBody: function () {
      return query('div', this.body)[0];
    },

    open: function () {
      this.modal.modal('show');
    },

    close: function () {
      this.modal.modal('hide');
    }
  });
});
