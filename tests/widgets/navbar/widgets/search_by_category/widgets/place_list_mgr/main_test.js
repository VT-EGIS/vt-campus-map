define([
  'intern!object',
  'intern/chai!assert',
  'vtCampusMap/config',
  'tests/helpers',
  'intern/order!node_modules/sinon/lib/sinon',
  'vtCampusMap/widgets/navbar/widgets/search_by_category/widgets/place_list_mgr/main',
  'esri/tasks/QueryTask',
  'esri/tasks/query',
  'dojo/query',
  'dojo/dom-style'
], function (registerSuite, assert, config, helpers, sinon, PlaceListMgr,
             QueryTask, EsriQuery, dojoQuery, domStyle) {
  var placeListMgr, executeStub, fsets;

  registerSuite({
    name: 'Place List Manager',

    setup: function () {
      fsets = [ { features: {} }, { features: {} }, { features: {} }, ];
    },

    beforeEach: function () {
      var callback;

      executeStub = sinon.stub(QueryTask.prototype, 'execute');

      this.placeListFixture = helpers.createFixture('place-list-mgr'); 

      placeListMgr = new PlaceListMgr({
        categoryNames: ['Department', 'Building', 'Dining'],
        spatialReference: {},
        gazeteerLayerUrl: 'gazeteerLayerUrl'
      }, 'place-list-mgr');

      for(var i = 0; i < executeStub.callCount; i++) {
        callback = executeStub.getCall(i).args[1];
        callback(fsets[i]);
      }
    },

    afterEach: function () {
      executeStub.restore();
      placeListMgr.destroy();
      this.placeListFixture.remove();
    },

    'it should use the correct query': function () {
      var args, query;

      assert.strictEqual(executeStub.callCount, 3);
      args = executeStub.getCall(0).args;
      assert.lengthOf(args, 2);
      query = args[0];
      assert.instanceOf(query, EsriQuery);
      assert.strictEqual(query.where, "Category = 'Department'");
    },

    'it should create a place list for each category initially hidden': function () {
      var listGroup;

      listGroup = dojoQuery('.list-group', placeListMgr.domNode);
      assert.lengthOf(listGroup, 3);
      assert.strictEqual(domStyle.get(listGroup[0], 'display'), 'none');
      assert.strictEqual(domStyle.get(listGroup[1], 'display'), 'none');
      assert.strictEqual(domStyle.get(listGroup[2], 'display'), 'none');
    },

    'showPlaceListFor': {
      beforeEach: function () {
        placeListMgr.showPlaceListFor('Building');
      },
      'should show the place list for the new category': function () {
        assert.strictEqual(domStyle.get(dojoQuery('.list-group', placeListMgr.domNode)[1], 'display'), 'block');
      },
      'should hide the place list for the current category': function () {
        placeListMgr.showPlaceListFor('Dining');
        assert.strictEqual(domStyle.get(dojoQuery('.list-group', placeListMgr.domNode)[1], 'display'), 'none');
      }
    }
  });
}); 
