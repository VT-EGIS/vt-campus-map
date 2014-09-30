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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-style',
  'dojo/text!./templates/search_by_category_modal.html',
  'dojo/text!./templates/list_of_items_in_modal.html'
], function (declare, _WidgetBase, _TemplatedMixin, EsriQuery, QueryTask,
             dom, domConstruct, dojoQuery, on, dojoRequest, lang, array,
             domStyle, modalTemplate, listItemTemplate) {
  
  return declare([_WidgetBase, _TemplatedMixin], {
    constructor : function (opts) {
      lang.mixin(this, opts);
      this._categoryElements = {};
      this._placeGeometries = {};
      this._currentPlacesListElement = null;
    },

    templateString : modalTemplate,

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
        array.forEach(categories, function(category) {
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
      query.returnGeometry = true; 
      query.outFields = ['Name', 'OBJECTID_12'];
      query.where = "Category = '" + categoryName + "'";
      query.orderByFields = ['Name ASC'];
      query.outSpatialReference = {'wkid': 102100};

      queryTask = new QueryTask(this.gazeteerLayer + '/0');
      queryTask.execute(query, function(fset) { 
        var placesListTemplate, placesListElement;

        placesListTemplate = '<div class="list-group">';

        array.forEach(fset.features, function(feature) {
          placesListTemplate += lang.replace(listItemTemplate, {
            id : 'place-' + feature.attributes.OBJECTID_12,
            name : feature.attributes.NAME,
            category : '',
            addr : ''
          });

          _this.setPlaceGeometry(feature.attributes.OBJECTID_12, feature.geometry);
          
        });
        
        placesListTemplate += '</div>';

        placesListElement = domConstruct.toDom(placesListTemplate);

        domConstruct.create(placesListElement, attr, container);

        _this.setCategoryElement(categoryName, placesListElement);

        on(placesListElement, 'a:click', function (evt) {
          var point;

          point = _this.getPlaceGeometry(evt.target.id.split('place-')[1]);
          _this.onClickHandler(point);
        });
      });
    },

    getPlaceGeometry : function (placeId) {
      return this._placeGeometries[placeId];
    },

    setPlaceGeometry : function (placeId, geometry) {
      this._placeGeometries[placeId] = geometry;
    },

    setCategoryElement : function (categoryName, placesListElement) {
      this._categoryElements[categoryName] = placesListElement;
    },

    getCategoryElement : function (categoryName) {
      return this._categoryElements[categoryName];
    },

    updateCurrentPlacesListElement : function (categoryName) {
      var element;

      if(this._currentPlacesListElement) {
        domStyle.set(this._currentPlacesListElement, 'display', 'none');
      }

      element = this.getCategoryElement(categoryName);
      this._currentPlacesListElement = element;
      
      if(this._currentPlacesListElement) {
        domStyle.set(this._currentPlacesListElement, 'display', 'block');
      }
    }
  });
});
