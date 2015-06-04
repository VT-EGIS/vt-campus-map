define([
  'intern!object',
  'intern/chai!assert',
  'tests/helpers',
  'vtCampusMap',
  'esri/geometry/Point',
  'esri/SpatialReference',
  'dojo/dom-style',
  'dojo/query',
  'intern/order!node_modules/sinon/lib/sinon',
  'vtCampusMap/google_analytics_manager',
  'intern/order!vendor/annyang.min',
  'dojo/NodeList-manipulate'
], function (registerSuite, assert, helpers, VTCampusMap, Point,
             SpatialReference, domStyle, dojoQuery, sinon, ga) {
  var vtCampusMap, mapFixture, navbarFixture, busStopPoint, parkingLotPoint, bikeRackPoint, buildingPoint, spatialRef;

  spatialRef = new SpatialReference({ wkid: 102100 });

  parkingLotPoint = new Point(-8953353.39039396, 4469968.670688197, spatialRef);
  busStopPoint = new Point(-8952689.946188003, 4470147.80454545, spatialRef);
  bikeRackPoint = new Point(-8952669.93587151, 4471108.955887499, spatialRef);
  buildingPoint = new Point(-8952519.749054195, 4471299.152711759, spatialRef);

  registerSuite({
    name: 'Map Info Manager',

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
      window.__gaTracker = function () {};
    },

    afterEach : function () {
      vtCampusMap.map.infoWindow.hide();
      vtCampusMap.destroy();
      mapFixture.remove();
      navbarFixture.remove();
      delete window.__gaTracker;
    },

    'clicking on the map ': {
      'shows an info box with relevant results': function () {
        var dfd, popup;

        dfd = this.async(15000);

        setTimeout(function () {
          popup = dojoQuery('.esriPopupMobile')[0];
          assert.strictEqual(domStyle.get(popup, 'display'), 'none');
          vtCampusMap.map.emit('click', { mapPoint: parkingLotPoint });
          setTimeout(dfd.callback(function () {
            assert.strictEqual(domStyle.get(popup, 'display'), 'block');
            assert.include(dojoQuery(popup).text(), 'Duck Pond Rd. Parking Lot');
          }), 13000);
        }, 1500);
      },

      'sends information to google analytics': {
        'building': function () {
          var spy, dfd;

          spy = sinon.spy(ga, 'report');
          dfd = this.async(11000);

          setTimeout(function () {
            vtCampusMap.map.emit('click', { mapPoint: buildingPoint });
            setTimeout(dfd.callback(function () {
              var args;
              assert.isTrue(spy.calledTwice);
              args = spy.getCall(0).args;
              assert.lengthOf(args, 2);
              assert.strictEqual(args[0], ga.actions.SEL_MAP_PLACE);
              assert.strictEqual(args[1], 'Holden Hall');
              args = spy.getCall(1).args;
              assert.lengthOf(args, 2);
              assert.strictEqual(args[0], ga.actions.SEL_MAP_PLACE);
              assert.strictEqual(args[1], 'McBryde Hall');
              spy.restore();
            }), 9000);
          }, 800);
        },
        
        'bus stop': function () {
          var spy, dfd;

          spy = sinon.spy(ga, 'report');
          dfd = this.async(11000);

          setTimeout(function () {
            vtCampusMap.map.on('zoom-end', function () {
              vtCampusMap.map.emit('click', { mapPoint: busStopPoint });
              setTimeout(dfd.callback(function () {
                var args;
                assert.isTrue(spy.calledOnce);
                args = spy.getCall(0).args;
                assert.lengthOf(args, 2);
                assert.strictEqual(args[0], ga.actions.SEL_MAP_PLACE);
                assert.strictEqual(args[1], 'Bus Stop 1126');
                spy.restore();
              }), 9000);
            });
            vtCampusMap.map.centerAndZoom(busStopPoint, 19);
          }, 800);
        },

        'parking lot': function () {
          var spy, dfd;

          spy = sinon.spy(ga, 'report');
          dfd = this.async(11000);

          setTimeout(function () {
            vtCampusMap.map.emit('click', { mapPoint: parkingLotPoint });
            setTimeout(dfd.callback(function () {
              var args;
              assert.isTrue(spy.calledOnce);
              args = spy.getCall(0).args;
              assert.lengthOf(args, 2);
              assert.strictEqual(args[0], ga.actions.SEL_MAP_PLACE);
              assert.strictEqual(args[1], 'Duck Pond Rd. Parking Lot');
              spy.restore();
            }), 9000);
          }, 800);
        },

        'bike rack': function () {
          var spy, dfd;

          spy = sinon.spy(ga, 'report');
          dfd = this.async(11000);

          setTimeout(function () {
            vtCampusMap.map.on('zoom-end', function () {
              vtCampusMap.map.emit('click', { mapPoint: bikeRackPoint });
              setTimeout(dfd.callback(function () {
                var args;
                //FIXME I should only be called once
                assert.isTrue(spy.calledTwice);
                args = spy.getCall(0).args;
                assert.lengthOf(args, 2);
                assert.strictEqual(args[0], ga.actions.SEL_MAP_PLACE);
                assert.strictEqual(args[1], 'Bike Rack 145');
                spy.restore();
              }), 9000);
            });
            vtCampusMap.map.centerAndZoom(bikeRackPoint, 19);
          }, 800);
        },
      }
    }
  });
}); 
