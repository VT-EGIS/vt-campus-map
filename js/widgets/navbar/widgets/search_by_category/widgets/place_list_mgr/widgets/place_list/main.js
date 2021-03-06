define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_Container',
  'dojo/dom-style',
  'dojo/_base/array',
  'dojo/_base/lang',
  './widgets/place',
  'dijit/registry',
  'dojo/query',
  'vtCampusMap/vt_campus_map_rpts'
], function (declare, _WidgetBase, _TemplatedMixin, _Container, domStyle,
             array, lang, Place, registry, query, ga) {
  return declare([_WidgetBase, _TemplatedMixin, _Container], {
    templateString: '<div class="list-group"></div>',

    postCreate: function () {
      array.forEach(this.features, lang.hitch(this, function (feature) {
        this.addChild(new Place({
          id: 'place-' + feature.attributes.objectid_12,
          name : feature.attributes.name,
          geometry: feature.geometry
        }));
      }));
      this.hide();
      this.attachEventHandlers();
    },

    attachEventHandlers: function () {
      this.on('a:click', lang.hitch(this, function (evt) {
        var place;

        place = registry.byId(query(evt.target).attr('widgetid')[0]);
        this.placeIdentifier.identify(place.geometry);
        ga.report(ga.actions.SEL_SEARCHCAT_PLACE, place.name);
      }));
    },

    hide: function () {
      domStyle.set(this.domNode, 'display', 'none');
    },

    show: function () {
      domStyle.set(this.domNode, 'display', 'block');
    },
  });
});
