define([
  'dojo/_base/declare',
  '../modal/main',
  'dojo/query',
  'dojo/request/xhr',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/text!./template.html',
  './widgets/place_list_mgr/main',
  'vtCampusMap/vt_campus_map_rpts'
], function (declare, Modal, dojoQuery, dojoRequest, lang, array, template,
             PlaceListMgr, ga) {
  
  return declare([Modal], {

    postCreate : function () {
      this.inherited(arguments);
      this.setTitle('Search by Category');
      this.setBody(template);
      this.selectElem = dojoQuery('select', this.domNode)[0];
      this.loadCategories()
        .then(lang.hitch(this, 'createPlaceListMgr'))
        .then(lang.hitch(this, 'attachEventHandlers'));
    },

    createPlaceListMgr: function (categoryNames) {
      this.placeListMgr = new PlaceListMgr({
        categoryNames: categoryNames,
        placeIdentifier: this.placeIdentifier,
        spatialReference: this.spatialReference,
        gazeteerLayerUrl: this.gazeteerLayerUrl
      }, dojoQuery('#category-items-list', this.domNode)[0]);
    },

    attachEventHandlers : function () {
      dojoQuery(this.selectElem).on('change', lang.hitch(this, function(evt) {
        ga.report(ga.actions.SEL_SEARCHCAT_CAT, evt.target.value.trim());
        this.placeListMgr.showPlaceListFor(evt.target.value.trim());
      }));
    },

    loadCategories: function () {
      return dojoRequest(this.gazeteerLayerUrl, {
        handleAs: 'json',
        query: {'f' : 'json'},
        headers: {'X-Requested-With': ''}
      }).then(lang.hitch(this, function (data) {
        var categories;

        categories = array.filter(data.fields, function (field) {
          return field.name === 'CATEGORY';
        })[0].domain.codedValues;

        categories.sort(function (a, b) {
          return (a.name === b.name ? 0 : (a.name < b.name ? -1 : 1));
        });

        return array.map(categories, lang.hitch(this, function (category) {
          this.selectElem.add(new Option(category.name, category.name));
          return category.name;
        }));
      })); 
    },
  });
});
