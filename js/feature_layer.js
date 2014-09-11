define([
    'dojo/_base/declare',
    'esri/tasks/IdentifyTask',
    'esri/layers/ArcGISDynamicMapServiceLayer'
], function (declare, IdentifyTask, ArcGISDynamicMapServiceLayer) {
  return declare([], {
    constructor : function (opts) {
      this._copyParameters(opts);

      if(this.numIdentifyLayers()) {
        this.createIdentifyTask();
      }
    },
    
    _copyParameters : function (opts) {
      for(var key in opts) {
        if(opts.hasOwnProperty(key)) {
          this[key] = opts[key];
        }
      }
    },

    createIdentifyTask : function () {
      this.task = new esri.tasks.IdentifyTask(this.getUrl());
    },

    getIdentifyTask : function () {
      return this.task;
    },

    numIdentifyLayers : function () {
      return this.identifyLayers ? this.identifyLayers.length : 0;
    },

    getLabel : function () {
      return this.label;
    },

    getUrl : function () {
      return this.url;
    },

    isVisible : function () {
      return this.visible;
    },

    getOpacity : function () {
      return this.opacity;
    },

    getDynamicMapServiceLayer : function () {
      return this.layer;
    },

    load : function () {
      this.layer = new ArcGISDynamicMapServiceLayer(this.getUrl(), this.getJSON());
      return this.layer;
    },

    getIdentifyLayers : function () {
      return this.identifyLayers;
    },

    getJSON : function () {
      return {
        label : this.getLabel(),
        url   : this.getUrl(),
        visible : this.isVisible(),
        opacity : this.getOpacity(),
        layer   : this.getDynamicMapServiceLayer(),
        identifyLayers : this.getIdentifyLayers()
      };
    },

    getInfo : function () {
      return {
        layer : this.getDynamicMapServiceLayer(),
        title : this.getLabel(),
        noLayers : true
      };
    },

    isVisibleNow : function () {
      return this.layer.visibleAtMapScale;
    }
  });
}); 
