define([
  'intern!object',
  'intern/chai!assert',
  'tests/helpers',
  'vtCampusMap/widgets/navbar/widgets/featured_places/main',
  'intern/order!node_modules/sinon/lib/sinon',
  'vtCampusMap/google_analytics_manager',
  'esri/geometry/Point',
  'dojo/query'
], function (registerSuite, assert, helpers, FeaturedPlaces, sinon, ga,
             Point, dojoQuery) {
  var featuredPlacesFixture, featuredPlaces, placeIdentifier; 

  registerSuite({
    name: 'Featured Places',

    setup: function () {
      window.__gaTracker = function () {};
    },

    teardown: function () {
      delete window.__gaTracker;
    },

    beforeEach: function () {
      placeIdentifier = { identify: function (){} };
      featuredPlacesFixture = helpers.createFixture('featured-places');
      featuredPlaces = new FeaturedPlaces({
        featuredPlaces: [
          { name : 'Ag Quad', geometry : { lat : 37.225351, lng : -80.423796 } },
          { name : 'Burruss Hall', geometry : { lat : 37.229054, lng : -80.423769 }, },
        ],
        placeIdentifier: placeIdentifier
      }, 'featured-places');
    },

    afterEach: function () {
      featuredPlaces.destroy();
      featuredPlacesFixture.remove();
    },

    'it creates a list of featured places': function () {
      var list;
      list = dojoQuery('li', featuredPlaces.domNode);
      assert.lengthOf(list, 2);
      assert.strictEqual(dojoQuery(list[0]).text(), 'Ag Quad');
      assert.strictEqual(dojoQuery(list[1]).text(), 'Burruss Hall');
    },

    'clicking on an item in the list': {
      'sends info to google analytics': function () {
        var ga_stub, dfd;

        dfd = this.async(1000);
        ga_stub = sinon.stub(ga, 'report');
        dojoQuery('a', this.domNode)[1].dispatchEvent(helpers.clickEvent());

        setTimeout(dfd.callback(function () {
          var args;

          assert.isTrue(ga_stub.calledOnce);
          args = ga_stub.getCall(0).args;
          assert.lengthOf(args, 2);
          assert.strictEqual(args[0], ga.actions.SEL_FEATURED_PLACE);
          assert.strictEqual(args[1], 'Burruss Hall');
          ga_stub.restore();
        }), 500);
      },

      'identifies the place on the map': function () {
        var identify_stub, dfd;

        dfd = this.async(1000);
        identify_stub = sinon.stub(placeIdentifier, 'identify');

        dojoQuery('a', this.domNode)[0].dispatchEvent(helpers.clickEvent());

        setTimeout(dfd.callback(function () {
          var args;

          assert.isTrue(identify_stub.calledOnce);
          args = identify_stub.getCall(0).args;
          assert.lengthOf(args, 1);
          assert.instanceOf(args[0], Point);
          assert.closeTo(args[0].x, -8952736.018381959, 0.000001);
          assert.closeTo(args[0].y, 4470564.532209189, 0.000001);
          assert.strictEqual(args[0].spatialReference.wkid, 102100);
          identify_stub.restore();
        }), 500);
      },
    }
  });
}); 
