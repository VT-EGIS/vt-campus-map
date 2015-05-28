define([
  'intern!object',
  'intern/chai!assert',
  'vtCampusMap/google_analytics_manager',
  'intern/order!node_modules/sinon/lib/sinon'
], function (registerSuite, assert, ga, sinon) {
  var spy;

  registerSuite({
    name: 'Google Analytics Manager',

    beforeEach: function () {
      window.__gaTracker = function () {};
      spy = sinon.spy(window, '__gaTracker');
    },

    afterEach: function () {
      delete window.__gaTracker;
      spy.restore();
    },

    report : function () {
      var args;

      ga.report(ga.actions.SEL_MAP_TYPE, 'map type 1');

      assert.isTrue(spy.calledOnce);
      args = spy.getCall(0).args;
      assert.lengthOf(args, 5);
      assert.strictEqual(args[0], 'send');
      assert.strictEqual(args[1], 'event');
      assert.strictEqual(args[2], 'Map View Control');
      assert.strictEqual(args[3], 'Select Map Type');
      assert.strictEqual(args[4], 'map type 1');
    }
  });
});
