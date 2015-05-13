define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_Container',
  'dojo/_base/array',
  'dojo/_base/lang'
], function (declare, _WidgetBase, _TemplatedMixin, _Container, array, lang) {
  return declare([_WidgetBase, _TemplatedMixin, _Container], {
    templateString: '<ul></ul>',

    postCreate: function () {
      this.active = true;
      // This always catches events that bubble up from its children
      // that are links because a ul is not clickable
      this.on('click', lang.hitch(this, 'updateVisibility'));
    },

    activate: function () {
      array.forEach(this.getChildren(), function (child) {
        child.activate(true);
      });
    },

    deactivate: function () {
      array.forEach(this.getChildren(), function (child) {
        child.deactivate(true);
      });
    },

    updateVisibility: function () {
      var activeChildren;

      activeChildren = array.filter(this.getChildren(), function (child) {
        return child.active;
      });

      this.active = (activeChildren.length === 0) ? false : true;
    }
  });
});
