define([
  'dojo/_base/declare'
], function (declare) {
  return declare([], {
    constructor: function (layer) {
      this._layer = layer;
    },

    showLayer: function () {
      this._layer.setVisibility(true); 
    },

    hideLayer: function () {
      this._layer.setVisibility(false);
    }
  });
});
