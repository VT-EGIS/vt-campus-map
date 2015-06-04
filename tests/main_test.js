//XXX If any of the setTimeout tests fail try after increasing the timeout
define([
  'intern!object',
  'intern/chai!assert',
  './helpers',
  'vtCampusMap',
  'esri/map',
  'dojo/query',
  'dijit/registry',
  'intern/order!vendor/annyang.min'
], function (registerSuite, assert, helpers, VTCampusMap, Map, dojoQuery, registry) {
  var mapFixture, vtCampusMap, navbarFixture;

  registerSuite({
    name: 'VTCampusMap',

    setup: function () {
      window.TESTING = true;
    },

    teardown: function () {
      delete window.TESTING;
    },

    beforeEach: function () {
      mapFixture = helpers.createFixture('vt-campus-map');
      navbarFixture = helpers.createFixture('vt-navbar');
      vtCampusMap = new VTCampusMap({}, 'vt-campus-map');
    },

    afterEach : function () {
      vtCampusMap.destroy();
      mapFixture.remove();
      navbarFixture.remove();
    },

    'has a map': function () {
      assert.instanceOf(vtCampusMap.map, Map);
    },

    'has all the relevant layers': function () {
      assert.lengthOf(vtCampusMap.map.layerIds, 10);
      assert.include(vtCampusMap.map.layerIds, 'VT Campus Grid');
      assert.include(vtCampusMap.map.layerIds, 'Roads');
      assert.include(vtCampusMap.map.layerIds, 'Parking Lots');
      assert.include(vtCampusMap.map.layerIds, 'Parking Spaces');
      assert.include(vtCampusMap.map.layerIds, 'Emergency Phones');
      assert.include(vtCampusMap.map.layerIds, 'Buildings');
      assert.include(vtCampusMap.map.layerIds, 'Athletic Parking Lots');
      assert.include(vtCampusMap.map.layerIds, 'Alternate Transportation');
      assert.include(vtCampusMap.map.layerIds, 'Accessibility');
    },

    'scrollWheelZoom is enabled': function () {
      var dfd;

      dfd = this.async(1000);

      setTimeout(dfd.callback(function () {
        assert.isTrue(vtCampusMap.map.isScrollWheelZoom);
      }), 900);
    },

    'has all the required widgets': {
      'navbar': function () {
        var dfd;

        dfd = this.async(2000);

        setTimeout(dfd.callback(function () {
          assert.isDefined(registry.byId('vt-navbar'));
        }), 1900);
      },

      'home button': function () {
        var dfd;

        dfd = this.async(2000);

        setTimeout(dfd.callback(function () {
          assert.isDefined(registry.byId('home-button'));
          assert.lengthOf(dojoQuery('#home-button', mapFixture), 1);
        }), 1900);
      },

      'locate button': function () {
        var dfd;

        dfd = this.async(2000);

        setTimeout(dfd.callback(function () {
          assert.isDefined(registry.byId('locate-button'));
          assert.lengthOf(dojoQuery('#locate-button', mapFixture), 1);
        }), 1900);
      },

      'scale bar': function () {
        var dfd;

        dfd = this.async(2000);

        setTimeout(dfd.callback(function () {
          assert.lengthOf(dojoQuery('.esriScalebar'), 1);
        }), 1900);
      },
    }
  });
}); 
