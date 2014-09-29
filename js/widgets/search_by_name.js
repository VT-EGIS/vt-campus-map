define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/query',
  'dojo/on',
  'dojo/keys',
  'dojo/text!./templates/search_by_name_modal.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'dojoBootstrap/Typeahead'
], function (declare, _WidgetBase, _TemplatedMixin, dojoQuery, on,
             keys, modalTemplate, lang, array, EsriQuery, QueryTask) {

  return declare([_WidgetBase, _TemplatedMixin], {
    constructor : function (opts) {
      this._names = [];
      this._inputBox = null;
      lang.mixin(this, opts);
    },
    
    templateString : modalTemplate,

    postCreate : function () {
      this._getNames(this._initializeTypeahead);
      this._setInputBox();
    },

    _setInputBox : function () {
      this._inputBox = dojoQuery('input', this.domNode)[0];
    },

    _getNames : function (doneCallback) {
      var query, queryTask, _this;

      _this = this;

      query = new EsriQuery();
      query.returnGeometry = false;
      query.outFields = ['Name'];
      query.where = '1=1';
      query.outSpatialReference = {'wkid': 102100};

      queryTask = new QueryTask(this.gazeteerLayer + '/0');

      queryTask.execute(query)
        .then(function(fset) {
          _this._names = array.map(fset.features, function(feature) {
            return feature.attributes.NAME;
          });
        })
        .then(function() {
          doneCallback.call(_this);
        });
    },

    _initializeTypeahead : function () {
      var container;

      on(this.domNode, 'shown.bs.modal', function (evt) {
        dojoQuery('input', evt.target)[0].focus();
      });

      container = dojoQuery('.modal-body', this.domNode);

      container.on('a:click', lang.hitch(this, this._processPlace));
      on(container, 'keyup', lang.hitch(this, function (evt) {
        if(evt.keyCode === keys.ENTER || evt.charCode === keys.ENTER) {
          this._processPlace(evt);
          dojoQuery.NodeList([this.domNode]).modal('hide');
        }
      }));

      dojoQuery('input', this.domNode).typeahead({
        source : this._names,
        item: '<a href="#" class="list-group-item" data-dismiss="modal"></a>',
        menu: '<div></div>',
        elQueryString: 'a',
        items  : 10,
        minLength : 1,
        container : container[0] 
      });
    },

    _processPlace : function () {
      var searchText, query, queryTask, _this;

      searchText = this._inputBox.value;
      this._inputBox.value = '';

      _this = this;

      query = new EsriQuery();
      query.returnGeometry = true;
      query.where = "Name = '" + searchText + "'";
      query.outSpatialReference = {'wkid': 102100};

      queryTask = new QueryTask(this.gazeteerLayer + '/0');

      queryTask.execute(query).then(lang.hitch(this, function (fset) {
        this.onClickHandler.call(this.mapContext, fset.features[0].geometry);
      }));
    }
  }); 
});
