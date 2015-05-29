//TODO remove this widget and create a modal directly in the navbar
// Create the featured places thing and put it in the body there
define([
  'dojo/_base/declare',
  '../modal/main',
  '../featured_places/main',
  'dojo/Evented'
], function (declare, Modal, FeaturedPlaces, Evented) {
  return declare([Modal, Evented], {
    postCreate: function () {
      this.inherited(arguments);
      this.setTitle('Featured Places');
      this.createFeaturedPlaces();
    },

    createFeaturedPlaces: function () {
      this.dijit = new FeaturedPlaces({
        featuredPlaces: this.featuredPlaces,
        placeIdentifier: this.placeIdentifier
      }, this.body);
    },
  });
});
