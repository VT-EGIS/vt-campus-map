define([
  'intern!object',
  'intern/chai!assert',
  'tests/helpers',
  'intern/order!node_modules/sinon/lib/sinon',
  'vtCampusMap/widgets/navbar/widgets/search_by_category/widgets/place_list_mgr/widgets/place_list/main',
  'dojo/query',
  'dojo/dom-style',
  'vtCampusMap/vt_campus_map_rpts',
  'dojo/NodeList-manipulate'
], function (registerSuite, assert, helpers, sinon, PlaceList, dojoQuery,
             domStyle, ga) {
  var placeList, placeIdentifier, features;

  registerSuite({
    name: 'Place List',

    setup: function () {
      window.__gaTracker = function () {};
      placeIdentifier = { identify: function () {} };
      features = [
        { attributes: { NAME: 'feature1', OBJECTID_12: 1 }, geometry: {} },
        { attributes: { NAME: 'feature2', OBJECTID_12: 2 }, geometry: {} },
        { attributes: { NAME: 'feature3', OBJECTID_12: 3 }, geometry: {} },
      ];
    },
    
    teardown: function () {
      delete window.__gaTracker;
    },

    beforeEach: function () {
      this.placeListFixture = helpers.createFixture('place-list');

      placeList = new PlaceList({
        features: features,
        placeIdentifier: placeIdentifier
      }, 'place-list');
    },

    afterEach: function () {
      placeList.destroy();
      this.placeListFixture.remove();
    },

    'it should create places for all features': function () {
      var items;

      items = dojoQuery('.list-group-item', placeList.domNode);
      assert.lengthOf(items, 3);
      assert.strictEqual(items.at(0).text().trim(), 'feature1');
      assert.strictEqual(items.at(1).text().trim(), 'feature2');
      assert.strictEqual(items.at(2).text().trim(), 'feature3');
    },

    'clicking a feature': {
      'should identify the feature': function () {
        var item, stub, args;

        stub = sinon.stub(placeIdentifier, 'identify');
        item = dojoQuery('.list-group-item', placeList.domNode)[1];

        item.dispatchEvent(helpers.clickEvent());
        assert.isTrue(stub.calledOnce);
        args = stub.getCall(0).args;
        assert.lengthOf(args, 1);
        assert.strictEqual(args[0], features[1].geometry);

        stub.restore();
      },

      'should send info to google analytics': function () {
        var item, stub, args;

        stub = sinon.stub(ga, 'report');
        item = dojoQuery('.list-group-item', placeList.domNode)[1];

        item.dispatchEvent(helpers.clickEvent());
        assert.isTrue(stub.calledOnce);
        args = stub.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], ga.actions.SEL_SEARCHCAT_PLACE);
        assert.strictEqual(args[1], 'feature2');

        stub.restore();
      }
    },

    'hide': function () {
      placeList.hide();
      assert.strictEqual(domStyle.get(placeList.domNode, 'display'), 'none');
    },

    'show': function () {
      placeList.show();
      assert.strictEqual(domStyle.get(placeList.domNode, 'display'), 'block');
    }
  });
}); 
