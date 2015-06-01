define([
  'dojo/_base/declare'
], function (declare) {
  return declare([], {
    constructor: function (parentLayer) {
      this._parentLayer = parentLayer;
    },

    showLayer: function (view) {
      var visibleLayers;

      visibleLayers = this._parentLayer.visibleLayers;
      //show if not already shown
      if(visibleLayers.indexOf(view.layerId) === -1) {
        this._parentLayer.setVisibleLayers([].concat(visibleLayers, view.layerId));
      }
    },

    hideLayer: function (view) {
      var index, visibleLayers;

      visibleLayers = this._parentLayer.visibleLayers;
      index = visibleLayers.indexOf(view.layerId);
      //hide if not already hidden
      if(index !== -1) {
        visibleLayers.splice(index, 1);
        // Note: setVisibleLayers does not behave as expected when
        // the array of layers is empty, we need to give it an
        // array containing -1 (I think it's counterintuitive)
        if(!visibleLayers.length) { visibleLayers = [-1]; }
        this._parentLayer.setVisibleLayers(visibleLayers);
      }
    }
  });
});
