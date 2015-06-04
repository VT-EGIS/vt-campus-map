define([
  'intern!object',
  'intern/chai!assert',
  'vtCampusMap/widgets/navbar/widgets/search_by_name/main',
  'intern/order!node_modules/sinon/lib/sinon',
  'tests/helpers',
  'vtCampusMap/google_analytics_manager',
  'dojo/dom-class',
  'dojo/query',
  'esri/tasks/QueryTask',
  'esri/tasks/query',
  'dojo/Deferred',
  'intern/order!vendor/annyang.min',
  'dojo/NodeList-manipulate'
], function (registerSuite, assert, SearchByName, sinon, helpers, ga, domClass,
             dojoQuery, QueryTask, EsriQuery, Deferred) {
  var searchByName, placeIdentifier, execute_stub, fset;

  registerSuite({
    name: 'Search by name',

    setup: function () {
      window.__gaTracker = function () {};
      placeIdentifier = { identify: function () {} };

      fset = {
        features: [
          { attributes: { NAME: 'feature1' }, geometry: {} },
          { attributes: { NAME: 'feature2' }, geometry: {} },
          { attributes: { NAME: 'feature3' }, geometry: {} },
          { attributes: { NAME: 'feature4' }, geometry: {} }
        ]
      };

      execute_stub = sinon.stub(QueryTask.prototype, 'execute', function () {
        var dfd;

        dfd = new Deferred();
        dfd.resolve(fset);
        return dfd;
      });
    },

    teardown: function () {
      delete window.__gaTracker;
      execute_stub.restore();
    },

    beforeEach: function () {
      this.searchFixture = helpers.createFixture('search-by-name');

      searchByName = new SearchByName({
        placeIdentifier: placeIdentifier,
        gazeteerLayerUrl: 'http://gazeteerLayerUrl.com'
      }, 'search-by-name');
    },

    afterEach: function () {
      searchByName.destroy();
      this.searchFixture.remove();
    },

    'it is a modal': function () {
      domClass.contains(searchByName.domNode, 'modal');
    },

    'it has the correct title': function () {
      assert.strictEqual(dojoQuery('.modal-title', searchByName.domNode).text(), 'Search by Name');
    },

    'it shows a list of matching places when something is typed in the input box': function () {
      var input, resultsDiv;

      input = dojoQuery('input', searchByName.domNode); 
      input.val('a');
      input[0].dispatchEvent(helpers.keyupEvent());
      resultsDiv = dojoQuery('.modal-body div', searchByName.domNode);
      assert.lengthOf(resultsDiv, 1);
      assert.lengthOf(dojoQuery('a', resultsDiv[0]), 4);
    },

    'when a place is selected': {
      beforeEach: function () {
        searchByName.open();
      },

      'it identifies the place on the map': function () {
        var identify_stub, args, input, resultsDiv;

        identify_stub = sinon.stub(placeIdentifier, 'identify');

        input = dojoQuery('input', searchByName.domNode); 
        input.val('a');
        input[0].dispatchEvent(helpers.keyupEvent());
        resultsDiv = dojoQuery('.modal-body div', searchByName.domNode)[0];
        dojoQuery('a', resultsDiv)[0].dispatchEvent(helpers.clickEvent());
        
        assert.isTrue(identify_stub.calledOnce);
        args = identify_stub.getCall(0).args;
        assert.lengthOf(args, 1);
        assert.strictEqual(args[0], fset.features[0].geometry);

        identify_stub.restore();
      },

      'it sends info to google analytics': function () {
        var ga_stub, args, input, resultsDiv;

        ga_stub = sinon.stub(ga, 'report');

        input = dojoQuery('input', searchByName.domNode); 
        input.val('a');
        input[0].dispatchEvent(helpers.keyupEvent());
        resultsDiv = dojoQuery('.modal-body div', searchByName.domNode)[0];
        dojoQuery('a', resultsDiv)[0].dispatchEvent(helpers.clickEvent());

        assert.isTrue(ga_stub.calledOnce);
        args = ga_stub.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], ga.actions.SEL_SEARCHNAME_PLACE);
        assert.strictEqual(args[1], 'feature1');

        ga_stub.restore();
      }
    }
  });
});
