define([
  'intern!object',
  'intern/chai!assert',
  'vtCampusMap/widgets/navbar/widgets/map_type_gallery/main',
  'bootstrapMap',
  'tests/helpers',
  'vtCampusMap/config',
  'dojo/query',
  'dojo/dom-class',
  'vtCampusMap/google_analytics_manager',
  'intern/order!node_modules/sinon/lib/sinon',
  'dojo/NodeList-manipulate'
], function (registerSuite, assert, MapTypeGallery, bootstrapMap, helpers,
             config, dojoQuery, domClass, ga, sinon) {
  var mapTypeGallery, mapFixture, galleryFixture, nodes;

  registerSuite({
    name: 'Map Type Gallery',

    setup: function () {
      window.__gaTracker = function () {};
    },

    teardown: function () {
      delete window.__gaTracker;
    },

    beforeEach: function () {
      mapFixture = helpers.createFixture('vt-campus-map');
      galleryFixture = helpers.createFixture('maptype-gallery');

      mapTypeGallery = new MapTypeGallery({
        map: bootstrapMap.create('vt-campus-map', config.map),
        mapTypes: config.mapTypes
      }, 'maptype-gallery');

      nodes = dojoQuery('li', mapTypeGallery.domNode);
    },

    afterEach: function () {
      mapTypeGallery.map.destroy();
      mapTypeGallery.destroy();
      galleryFixture.remove();
      mapFixture.remove();
    },

    'creates a gallery of map types': {
      'has the correct amount of list items': function () {
        assert.lengthOf(nodes, 2);
      },

      'has the correct labels': function () {
        assert.strictEqual(nodes.at(0).text().trim(), 'Schematic');
        assert.strictEqual(nodes.at(1).text().trim(), 'Aerial Photo');
      },

      'has image thumbnails': function () {
        assert.lengthOf(dojoQuery('img', nodes[0]), 1);
        assert.lengthOf(dojoQuery('img', nodes[1]), 1);
      }
    },

    'defaultMapTypeIndex': {
      'when not provided, selects the first one': function () {
        assert.isTrue(mapTypeGallery.map.getLayer('Schematic0').visible);
        assert.isTrue(mapTypeGallery.map.getLayer('Schematic1').visible);
        assert.isFalse(mapTypeGallery.map.getLayer('Aerial Photo0').visible);
      }, 
      'when provided, selects that one': function () {
        mapTypeGallery.destroy();
        mapTypeGallery = new MapTypeGallery({
          map: bootstrapMap.create('vt-campus-map', config.map),
          mapTypes: config.mapTypes,
          defaultMapTypeIndex: 1
        }, 'maptype-gallery');
        assert.isFalse(mapTypeGallery.map.getLayer('Schematic0').visible);
        assert.isFalse(mapTypeGallery.map.getLayer('Schematic1').visible);
        assert.isTrue(mapTypeGallery.map.getLayer('Aerial Photo0').visible);
      }
    },

    'when a map type is selected': {
      'hides the current map type': function () {
        var dfd;

        dfd = this.async(1000);
        assert.isTrue(domClass.contains(nodes[0], 'mapType-selected'));
        assert.isTrue(mapTypeGallery.map.getLayer('Schematic0').visible);
        assert.isTrue(mapTypeGallery.map.getLayer('Schematic1').visible);

        dojoQuery('img', nodes[1])[0].dispatchEvent(helpers.clickEvent());

        setTimeout(dfd.callback(function () {
          assert.isFalse(domClass.contains(nodes[0], 'mapType-selected'));
          assert.isFalse(mapTypeGallery.map.getLayer('Schematic0').visible);
          assert.isFalse(mapTypeGallery.map.getLayer('Schematic1').visible);
        }), 100);
      },

      'displays the selected one': function () {
        var dfd;

        dfd = this.async(1000);
        assert.isFalse(mapTypeGallery.map.getLayer('Aerial Photo0').visible);
        assert.isFalse(domClass.contains(nodes[1], 'mapType-selected'));

        dojoQuery('img', nodes[1])[0].dispatchEvent(helpers.clickEvent());

        setTimeout(dfd.callback(function () {
          assert.isTrue(mapTypeGallery.map.getLayer('Aerial Photo0').visible);
          assert.isTrue(domClass.contains(nodes[1], 'mapType-selected'));
        }), 100);
      },

      'if map type changed, sends info to google analytics': function () {
        var dfd, ga_stub;

        ga_stub = sinon.stub(ga, 'report');
        dfd = this.async(1000);

        dojoQuery('img', nodes[1])[0].dispatchEvent(helpers.clickEvent());

        setTimeout(dfd.callback(function () {
          var args;

          assert.isTrue(ga_stub.calledOnce);
          args = ga_stub.getCall(0).args;
          assert.lengthOf(args, 2);
          assert.strictEqual(args[0], ga.actions.SEL_MAP_TYPE);
          assert.strictEqual(args[1], 'Aerial Photo');
          ga_stub.restore();
        }), 100);
      },

      'if map type remained the same, does not send info to google analytics': function () {
        var dfd, ga_stub;

        ga_stub = sinon.stub(ga, 'report');
        dfd = this.async(1000);

        dojoQuery('img', nodes[0])[0].dispatchEvent(helpers.clickEvent());

        setTimeout(dfd.callback(function () {
          assert.isFalse(ga_stub.calledOnce);
          ga_stub.restore();
        }), 100);
      }
    }
  });
}); 
