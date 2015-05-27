define([
    'intern!object',
    'intern/chai!assert',
    'vtCampusMap/widgets/place_identifier/main',
    'intern/order!node_modules/sinon/lib/sinon',
    'esri/geometry/Point',
    'esri/SpatialReference',
    'esri/tasks/QueryTask',
    'esri/tasks/query',
    'esri/graphic',
    'dojo/Deferred'
], function (registerSuite, assert, PlaceIdentifier, sinon, Point,
             SpatialReference, QueryTask, EsriQuery, Graphic, Deferred) {
  var geometry, map, placeIdentifier, stub, dfd, markerSymbol, borderSymbol;

  registerSuite({
    name: 'PlaceIdentifier',

    'identify': {
      beforeEach: function () {
        geometry = new Point(0, 0, new SpatialReference({ wkid: 102100 }));
        markerSymbol = {};
        borderSymbol = {};
        map = {
          getLayer: function () { return { url: 'fakeUrl'}; },
          centerAndZoom: function () {},
          graphics: { add: function () {}, clear: function () {} },
          infoWindow: { hide: function () {} }
        };
        dfd = new Deferred();
        stub = sinon.stub(QueryTask.prototype, 'execute', function () {
          return dfd;
        });
        placeIdentifier = new PlaceIdentifier({
          map: map,
          markerSymbol: markerSymbol,
          borderSymbol: borderSymbol
        });
      },

      afterEach: function () {
        stub.restore();
      },

      'it should add a border if possible': function () {
        var spy, feature;

        feature = new Graphic();
        spy = sinon.spy(map.graphics, 'add');

        placeIdentifier.identify(geometry);

        dfd.resolve({ features: [ feature ] });

        assert.isTrue(spy.calledTwice);
        assert.lengthOf(spy.getCall(0).args, 1);
        assert.strictEqual(spy.getCall(0).args[0], feature);
        assert.strictEqual(feature.symbol, borderSymbol);
        spy.restore();
      },

      'it should add a marker': function () {
        var spy, graphic;

        spy = sinon.spy(map.graphics, 'add');

        placeIdentifier.identify(geometry);

        dfd.resolve({});

        assert.isTrue(spy.calledOnce);
        assert.lengthOf(spy.getCall(0).args, 1);
        graphic = spy.getCall(0).args[0];
        assert.instanceOf(graphic, Graphic);
        assert.strictEqual(graphic.geometry, geometry);
        assert.strictEqual(graphic.symbol, markerSymbol);
        spy.restore();
      },

      'it should center and zoom the map at the given location': function () {
        var spy;

        spy = sinon.spy(map, 'centerAndZoom');

        placeIdentifier.identify(geometry);

        assert.isTrue(spy.calledOnce);
        assert.lengthOf(spy.getCall(0).args, 2);
        assert.strictEqual(spy.getCall(0).args[0], geometry);

        spy.restore();
      }
    }
  });
});
