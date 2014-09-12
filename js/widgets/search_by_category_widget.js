define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/on',
  'dojo/request/xhr',
  'dojo/text!./templates/search_by_category_modal.html',
  'dojo/text!./templates/list_of_items_in_modal.html'
], function (declare, _WidgetBase, _TemplatedMixin, EsriQuery, QueryTask,
             dom, domConstruct, dojoQuery, on, dojoRequest, modalTemplate,
             listItemTemplate) {
  
  return declare([_WidgetBase, _TemplatedMixin], {
    constructor : function (opts) {
      this._copyProperties(opts, this);
      this._categories = [];
      this._currentPlacesListElement = null;
    },

    templateString : modalTemplate,

    _copyProperties : function (opts, config) {
      for(var property in opts) {
        if(opts.hasOwnProperty(property)) {
          config[property] = opts[property];
        }
      }
    },

    postCreate : function () {
      this.inherited(arguments);
      this._loadCategories();
    },

    _attachEventHandlers : function () {
      var _this;

      _this = this;

      dojoQuery('select', this.domNode).on('change', function(evt) {
        _this.updateCurrentPlacesListElement(evt.target.value);
      });
    },

    _loadCategories: function () {
      var _this, container;

      _this = this;
      container = dojoQuery('#categoryItemsList', this.domNode)[0];

      dojoRequest(this.gazeteerLayer + '/0', {
        handleAs: 'json',
        query: {'f' : 'json'},
        headers: {'X-Requested-With': ''}
      }).then(function (data) {
        var categories, selectElem;

        categories = data.fields[7].domain.codedValues;
        categories.sort(function (a, b) {
          return (a.name === b.name ? 0 : (a.name < b.name ? -1 : 1));
        });
        selectElem = dojoQuery('select', this.domNode)[0];
        dojo.forEach(categories, function(category) {
          selectElem.add(new Option(category.name, category.name));
          _this._loadPlacesInCategory(category.name, container);
        });
        _this._attachEventHandlers();
      }); 
    },

    _loadPlacesInCategory : function (categoryName, container) {
      var query, queryTask, _this, attr;

      _this = this;
      attr = {style : 'display: none'};

      query = new EsriQuery();  
      query.returnGeometry = false; 
      query.outFields = ['OBJECTID_12','Name'];
      query.where = "Category = '" + categoryName + "'";
      query.orderByFields = ['Name ASC'];

      queryTask = new QueryTask(this.gazeteerLayer + '/0');
      queryTask.execute(query, function(fset) { 
        var placesListTemplate, placesListElement;

        placesListTemplate = '<div class="list-group">';

        dojo.forEach(fset.features, function(feature) {
          placesListTemplate += dojo.replace(listItemTemplate, {
            id : feature.attributes.OBJECTID_12,
            name : feature.attributes.NAME,
            category : "",
            addr : ""
          });
        });
        
        placesListTemplate += '</div>';

        placesListElement = domConstruct.toDom(placesListTemplate);

        domConstruct.create(placesListElement, attr, container);

        _this._registerCategory(categoryName, placesListElement);

        on(placesListElement, 'click', function (evt) {
          _this.onClickHandler.call(_this.mapContext, evt);
        });
      });
    },

    _registerCategory : function (categoryName, placesListElement) {
      this._categories[categoryName] = placesListElement;
    },

    _getPlacesListElementForCategory : function (categoryName) {
      return this._categories[categoryName];
    },

    updateCurrentPlacesListElement : function (categoryName) {
      var element;

      if(this._currentPlacesListElement) {
        dojo.setStyle(this._currentPlacesListElement, 'display', 'none');
      }

      element = this._getPlacesListElementForCategory(categoryName);
      
      if(!element) {
        return;
      }

      this._currentPlacesListElement = element;
      dojo.setStyle(this._currentPlacesListElement, 'display', 'block');
    }
  });
});
