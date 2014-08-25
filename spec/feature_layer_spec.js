define(['./js/feature_layer.js' ], function (FeatureLayer) {
  describe('FeatureLayer', function () {

    it('should take options', function () {
      var featureLayer;

      featureLayer = new FeatureLayer({
        label: 'Layer Label',
        url: "http://dummyurl.com",
        visible: true,
        opacity: 0.5
      });

      featureLayer.getLabel().should.equal('Layer Label');
      featureLayer.getUrl().should.equal('http://dummyurl.com');
      featureLayer.isVisible().should.be.true;
      featureLayer.getOpacity().should.equal(0.5);
    });
  });
});
