define([
  'dojo/_base/declare',
  '../modal/main',
  '../layers/widget'
], function (declare, Modal, Layers) {
  return declare([Modal], {
    postCreate: function () {
      this.inherited(arguments);
      this.setTitle('Layers');
      this.createLayersWidget();
    },

    createLayersWidget: function () {
      this.dijit = new Layers({ layers: this.layers, 'class': 'layers-list' }, this.body);
    },
  });
});
