define([
  'intern!object',
  'intern/chai!assert',
  'vtCampusMap/widgets/navbar/widgets/search_by_category/main',
  'tests/helpers',
  'intern/order!node_modules/sinon/lib/sinon',
  'vtCampusMap/config',
  'dojo/query',
  'tests/stubs/place_list_mgr/main',
  'vtCampusMap/vt_campus_map_rpts',
	'dojo/aspect',
  'dojo/NodeList-manipulate'
], function (registerSuite, assert, SearchByCategory, helpers, sinon,
             config, dojoQuery, PlaceListMgr, ga, aspect) {
  var searchByCategory, show_stub, ga_stub;

  registerSuite({
    name: 'Search by Category',

    setup: function () {
      // This needs to be done otherwise intern-runner hangs when doing
      // fake xhr
      aspect.after(sinon, 'useFakeXMLHttpRequest', function (xhr) {
        xhr.useFilters = true;
        xhr.addFilter(function (method, url) {
          return url.indexOf('/__intern') === 0;
        });
        return xhr;
      });

      window.__gaTracker = function () {};

      this.xhrResponseData = JSON.stringify({
        fields: [
          {
            name: 'CATEGORY',
            domain: {
              codedValues: [
                { name: 'Building' },
                { name: 'Research Center' },
                { name: 'Agricultural Facility' },
                { name: 'Parking' },
                { name: 'Department' }
              ]
            }
          }
        ]
      });

      this.server = sinon.fakeServer.create();

      this.server.respondWith('GET', 'http://gazeteerLayerUrl.com?f=json',
          [200, { 'Content-Type': 'application/json' }, this.xhrResponseData]);

      this.server.respondWith('GET', /^(http:\/\/gazeteerlayerurl.com)/,
          [200, { 'Content-Type': 'application/json' }, '']);
    },

    teardown: function () {
      delete window.__gaTracker;
      this.server.restore();
    },

    beforeEach: function () {
      this.searchFixture = helpers.createFixture('search-by-category');

      searchByCategory = new SearchByCategory({
        gazeteerLayerUrl: 'http://gazeteerLayerUrl.com'
      }, 'search-by-category');

      this.server.respond();
    },

    afterEach: function () {
      searchByCategory.destroy();
      this.searchFixture.remove();
    },

    'it should create a select element with relevant options in sorted order': function () {
      var options;

      options = dojoQuery('select option', searchByCategory.domNode);

      assert.lengthOf(options, 6);
      assert.strictEqual(options.at(0).text(), 'Select Category'); 
      assert.strictEqual(options.at(1).text(), 'Agricultural Facility'); 
      assert.strictEqual(options.at(2).text(), 'Building'); 
      assert.strictEqual(options.at(3).text(), 'Department'); 
      assert.strictEqual(options.at(4).text(), 'Parking'); 
      assert.strictEqual(options.at(5).text(), 'Research Center'); 
    },

    'when a select element is changed': {
      beforeEach: function () {
        var selectElt;

        show_stub = sinon.stub(PlaceListMgr.prototype, 'showPlaceListFor');
        ga_stub = sinon.stub(ga, 'report');
        selectElt = dojoQuery('select', searchByCategory.domNode)[0];
        selectElt.value = 'Department';
        selectElt.dispatchEvent(helpers.changeEvent());
      },

      afterEach: function () {
        show_stub.restore();
        ga_stub.restore();
      },

      'it should change the place list': function () {
        assert.isTrue(show_stub.calledOnce);
      },

      'it should send info to google analytics': function () {
        var args;

        assert.isTrue(ga_stub.calledOnce);
        args = ga_stub.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], ga.actions.SEL_SEARCHCAT_CAT);
        assert.strictEqual(args[1], 'Department');
      },
    }
  });
}); 
