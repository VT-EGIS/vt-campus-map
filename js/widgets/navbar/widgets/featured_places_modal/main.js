define([
  'dojo/_base/declare',
  '../modal/main',
  '../featured_places/main',
  'dojo/Evented',
  'dojo/_base/lang'
], function (declare, Modal, FeaturedPlaces, Evented, lang) {
  return declare([Modal, Evented], {
    postCreate: function () {
      this.inherited(arguments);
      this.setTitle('Featured Places');
      this.createFeaturedPlaces();
    },

    createFeaturedPlaces: function () {
      this.dijit = new FeaturedPlaces({
        featuredPlaces: this.featuredPlaces,
        map: this.map,
        markerSymbol: this.markerSymbol
      }, this.body);

      this.dijit.on('featuredPlaceSelected', lang.hitch(this, function (name) {
        this.emit('featuredPlaceSelected', name);
      }));
    },
  });
});
