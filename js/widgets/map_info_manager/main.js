define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'esri/tasks/IdentifyTask',
  'esri/tasks/IdentifyParameters',
  'esri/InfoTemplate',
  'dojo/promise/all',
  'vtCampusMap/vt_campus_map_rpts'
], function (declare, lang, array, IdentifyTask, IdentifyParameters,
             InfoTemplate, all, ga) {
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);

      this.identifiableLayers = [];

      this.setIdentifyParams();

      array.forEach(this.layerInfos, lang.hitch(this, function (layerInfo) {
        if(layerInfo.identifyLayers && layerInfo.identifyLayers.length) {
          this.createIdentifyTask(layerInfo);
          this.createInfoTemplate(layerInfo);
        }
      }));

      this.attachEventHanders();
    },

    setIdentifyParams: function () {
      this.defaultIdentifyParams = new IdentifyParameters();
      this.defaultIdentifyParams.tolerance = 10;
      this.defaultIdentifyParams.returnGeometry = true;
      this.defaultIdentifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
      this.defaultIdentifyParams.mapExtent = this.map.extent;
      this.defaultIdentifyParams.width  = this.map.width;
      this.defaultIdentifyParams.height = this.map.height;
    },

    createIdentifyTask: function (layerInfo) {
      layerInfo.task = new IdentifyTask(layerInfo.url);
    },

    createInfoTemplate: function (layerInfo) {
      array.forEach(layerInfo.identifyLayers, lang.hitch(this, function (identifyLayer) {
        var templateStr, itemStr;

        templateStr = '<table class="table table-hover table-bordered ">';
        itemStr = '<tr><td>{title}</td><td>{value}</td></tr>';

        array.forEach(identifyLayer.infoTemplateFields, function (field) {
          templateStr += lang.replace(itemStr, field);
        });

        templateStr += '</table>';

        identifyLayer.infoTemplate = new InfoTemplate({
          title: identifyLayer.infoTemplateTitle,
          content: templateStr
        });

        this.identifiableLayers[identifyLayer.layerName || layerInfo.id] = identifyLayer;
      }));
    },

    attachEventHanders: function () {
      this.map.on('click', lang.hitch(this, 'processClick'));
    },

    processClick: function (evt) {
      this.getInfoOnClickedPoint(evt)
        .then(lang.hitch(this, function (results) {
          this.showInfo(results, evt.mapPoint);
        }));
    },

    showInfo: function (results, mapPoint) {
      var features;

      this.map.infoWindow.hide();
      this.map.infoWindow.clearFeatures();
      this.map.graphics.clear();

      features = [];

      array.forEach(results, lang.hitch(this, function (identifyResults) {
        array.forEach(identifyResults, lang.hitch(this, function (result) {
          var infoTemplate, feature;

          feature = result.feature;
          infoTemplate = this.identifiableLayers[result.layerName].infoTemplate;

          feature.setInfoTemplate(infoTemplate);

          features.push(feature);

          this.sendGaInfo(feature.attributes, result.layerName);
        }));
      }));

      this.map.infoWindow.setFeatures(features);
      this.map.infoWindow.show(mapPoint);
    },

    sendGaInfo: function (attributes, layerName) {
      var value;

      if(attributes.name) {
        value = attributes.name;
      } else if(attributes.lot_name){
        value = attributes.lot_name + ' Parking Lot';
      } else if(attributes.id) {
        if(layerName === 'Bus Stops') {
          value = 'Bus Stop ' + attributes.id;
        } else {
          value = 'Bike Rack ' + attributes.id;
        }
      }
      ga.report(ga.actions.SEL_MAP_PLACE, value);
    },

    getInfoOnClickedPoint: function (evt) {
      var dfds;

      dfds = [];

      array.forEach(this.layerInfos, lang.hitch(this, function(layerInfo) {
        var identifyParams;

        if(layerInfo.task && layerInfo.layer.visibleAtMapScale) {

          identifyParams = lang.mixin(this.defaultIdentifyParams, {
            mapExtent: this.map.extent,
            geometry: evt.mapPoint
          });

          dfds.push(layerInfo.task.execute(identifyParams));
        }
      }));

      return all(dfds);
    }
  });
});
