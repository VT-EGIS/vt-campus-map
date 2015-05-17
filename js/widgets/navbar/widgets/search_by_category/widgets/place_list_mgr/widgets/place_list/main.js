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
  'vtCampusMap/widgets/place_identifier/main',
  'dojo/query'
], function (declare, _WidgetBase, _TemplatedMixin, _Container, domStyle,
             array, lang, Place, registry, PlaceIdentifier, query) {
  return declare([_WidgetBase, _TemplatedMixin, _Container], {
    templateString: '<div class="list-group"></div>',

    postCreate: function () {
      array.forEach(this.features, lang.hitch(this, function (feature) {
        this.addChild(new Place({
          id: 'place-' + feature.attributes.OBJECTID_12,
          name : feature.attributes.NAME,
          geometry: feature.geometry
        }));
      }));
      this.placeIdentifier = new PlaceIdentifier({
        map: this.map,
        markerSymbol: this.markerSymbol,
        borderSymbol: this.borderSymbol
      });
      this.hide();
      this.attachEventHandlers();
    },

    attachEventHandlers: function () {
      this.on('a:click', lang.hitch(this, function (evt) {
        var place;

        place = registry.byId(query(evt.target).attr('widgetid')[0]);
        this.placeIdentifier.identify(place.geometry);
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