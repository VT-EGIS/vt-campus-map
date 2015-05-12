define([
  'dojo/_base/declare',
  '../modal/main',
  'esri/dijit/Legend'
], function (declare, Modal, Legend) {
  return declare([Modal], {
    postCreate: function () {
      this.inherited(arguments);
      this.setTitle('Legend');
      this.createLegend();
    },

    createLegend: function () {
      this.dijit = new Legend({
        map: this.map,
        layerInfos: this.layerInfos
      }, this.body);

    },

    startup: function () {
      this.dijit.startup();
    }
  });
});
