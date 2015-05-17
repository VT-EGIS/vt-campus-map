define([
  'dojo/_base/declare',
  'dojo/query',
  'dojo/on',
  'dojo/text!./template.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'dojo/Evented',
  '../modal/main',
  'vtCampusMap/widgets/place_identifier/main',
  'dojo/query',
  'vtCampusMap/config',
  'dojoBootstrap/Typeahead'
], function (declare, dojoQuery, on, template, lang, array, EsriQuery,
             QueryTask, Evented, Modal, PlaceIdentifier, query, config) {

  return declare([Modal, Evented], {
    postCreate : function () {
      this.inherited(arguments);
      this.setTitle('Search by Name');
      this.setBody(template);
      this.placeIdentifier = new PlaceIdentifier({
        map: this.map,
        markerSymbol: this.markerSymbol,
        borderSymbol: this.borderSymbol
      });
      this.inputBox = query('input', this.domNode)[0];
      this.getNames()
        .then(lang.hitch(this, 'initializeTypeahead'))
        .then(lang.hitch(this, 'attachEventHandlers'));
      this.addVoiceCommands();
    },

    attachEventHandlers: function () {
      on(this.domNode, 'shown.bs.modal', lang.hitch(this, function () {
        this.inputBox.focus();
      }));

      on(this.inputBox, 'changed', lang.hitch(this, 'processPlace'));
    },

    getNames : function () {
      var query, queryTask;

      query = new EsriQuery();
      query.returnGeometry = true;
      query.outFields = ['Name'];
      query.where = '1=1';
      query.outSpatialReference = {'wkid': 102100};

      queryTask = new QueryTask(config.gazeteerLayerUrl);

      return queryTask.execute(query).then(lang.hitch(this, function(fset) {
        this.features = fset.features;
        this.names = array.map(fset.features, function(feature) {
          return feature.attributes.NAME;
        });
      }));
    },

    initializeTypeahead : function () {
      this.typeahead = dojoQuery(this.inputBox).typeahead({
        source : this.names,
        items  : 100,
        minLength : 1,
        item: '<a href="#" class="list-group-item" data-dismiss="modal"></a>',
        menu: '<div></div>',
        eltQueryStr: 'a',
        container: this.body
      });
    },

    processPlace : function () {
      var searchText, features;

      searchText = this.inputBox.value;
      this.inputBox.value = '';

      features = array.filter(this.features, function (feature) {
        return (feature.attributes.NAME === searchText);
      });

      array.forEach(features, lang.hitch(this, function (feature) {
        this.placeIdentifier.identify(feature.geometry);
      }));

      this.emit('placeSelected', searchText);
      this.close();
    },

    addVoiceCommands: function () {
      var commands;

      commands = {
        'show *place': lang.hitch(this, function (place) {
          this.inputBox.value = place;
          this.typeahead.data('typeahead')[0].lookup();
        }) 
      },

      annyang && annyang.addCommands(commands);
    }
  }); 
});