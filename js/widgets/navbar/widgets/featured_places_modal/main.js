define([
  'dojo/_base/declare',
  '../modal/main',
  '../featured_places/main'
], function (declare, Modal, FeaturedPlaces) {
  return declare([Modal], {
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
    },
  });
});
