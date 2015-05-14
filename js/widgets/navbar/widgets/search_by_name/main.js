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
      this.setTitle('Search');
      this.setBody(template);
      this.placeIdentifier = new PlaceIdentifier({
        map: this.map,
        markerSymbol: this.markerSymbol
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

      queryTask = new QueryTask(config.gazeteerLayerUrl + '/0');

      return queryTask.execute(query).then(function(fset) {
        return array.map(fset.features, function(feature) {
          return feature.attributes.NAME;
        });
      });
    },

    initializeTypeahead : function (names) {
      this.names = names;
      this.typeahead = dojoQuery(this.inputBox).typeahead({
        source : names,
        items  : 100,
        minLength : 1,
        item: '<a href="#" class="list-group-item" data-dismiss="modal"></a>',
        menu: '<div></div>',
        eltQueryStr: 'a',
        container: this.body
      });
    },

    processPlace : function () {
      var searchText, query, queryTask;

      searchText = this.inputBox.value;
      this.inputBox.value = '';

      this.emit('placeSelected', searchText);
      this.close();

      query = new EsriQuery();
      query.returnGeometry = true;
      query.where = "Name = '" + searchText + "'";
      query.outSpatialReference = config.spatialReference;

      queryTask = new QueryTask(config.gazeteerLayerUrl + '/0');
      queryTask.execute(query).then(lang.hitch(this, function (fset) {
        this.placeIdentifier.identify(fset.features[0].geometry);
      }));
    },

    addVoiceCommands: function () {
      var commands;

      commands = {
        'show me *place': lang.hitch(this, function (place) {
          this.inputBox.value = place;
          this.typeahead.data('typeahead')[0].lookup();
        }) 
      },

      annyang.addCommands(commands);
    }
  }); 
});
