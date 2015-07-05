define([
  'intern!object',
  'intern/chai!assert',
  'tests/helpers',
  'vtCampusMap/widgets/navbar/main',
  'bootstrapMap',
  'vtCampusMap/config',
  'dijit/registry',
  'dojo/dom',
  'dojo/dom-class',
  'intern/order!node_modules/sinon/lib/sinon',
  'vtCampusMap/google_analytics_manager',
  'dojo/query',
  'vtCampusMap/widgets/place_identifier/main',
  'esri/layers/FeatureLayer',
  'intern/order!vendor/annyang.min',
  'dojo/NodeList-manipulate'
], function (registerSuite, assert, helpers, VTNavbar, bootstrapMap,
             config, registry, dom, domClass, sinon, ga, dojoQuery,
             PlaceIdentifier, FeatureLayer) {
  var vtNavbar, navbarFixture, mapFixture, isMobileStub;

  registerSuite({
    name: 'VTNavbar',

    setup: function () {
      window.__gaTracker = function () {};
    },

    teardown: function () {
      delete window.__gaTracker;
    },

    beforeEach: function () {
      var layer1, layer2;

      layer1 = new FeatureLayer({ id: 'layer1' });
      layer1.hideOnStartup = true;
      layer2 = new FeatureLayer({ id: 'layer2' });
      navbarFixture = helpers.createFixture('vt-navbar');
      mapFixture = helpers.createFixture('vt-campus-map');
      isMobileStub = sinon.stub(VTNavbar.prototype, 'isMobile', function () {
        return false;
      });
      vtNavbar = new VTNavbar({
        map: bootstrapMap.create('vt-campus-map', config.map),
        layerInfos: config.layerInfos,
        gazeteerLayerUrl: config.gazeteerLayerUrl,
        layers: [layer1, layer2],
        markerSymbol: {},
        borderSymbol: {}
      }, 'vt-navbar');
    },

    afterEach : function () {
      vtNavbar.destroy();
      navbarFixture.remove();
      mapFixture.remove();
      isMobileStub.restore();
    },

    'has all the required widgets': {
      'map type gallery': function () {
        assert.isDefined(registry.byId('mapType-gallery'));
      },

      'legend modal': function () {
        var modal;

        modal = dom.byId('legend-modal');
        assert.isDefined(modal);
        assert.strictEqual(dojoQuery('.modal-title', modal).text(), 'Legend');
        assert.lengthOf(dojoQuery('#legend', modal), 1);
      },

      'about modal': function () {
        var modal;

        modal = dom.byId('about-modal');
        assert.isDefined(modal);
        assert.strictEqual(dojoQuery('.modal-title', modal).text(), 'About');
      },

      'featured place widget': {
        'not mobile': function () {
          assert.isDefined(registry.byId('featured-places'));
        },
        'mobile': function () {
          var modal;

          isMobileStub.restore();
          isMobileStub = sinon.stub(VTNavbar.prototype, 'isMobile', function () {
            return true;
          });
          vtNavbar.map.destroy();
          vtNavbar.destroy();
          navbarFixture = helpers.createFixture('vt-navbar');
          vtNavbar = new VTNavbar({
            map: bootstrapMap.create('vt-campus-map', config.map),
            layerInfos: config.layerInfos,
            layers: [],
            markerSymbol: {},
            borderSymbol: {}
          }, 'vt-navbar');
          modal = dom.byId('featured-places-modal');
          assert.isDefined(modal);
          assert.strictEqual(dojoQuery('.modal-title', modal).text(), 'Featured Places');
        }
      },

      'layers modal': function () {
        assert.isDefined(dom.byId('layers-modal'));
      },

      'search by name': function () {
        assert.isDefined(registry.byId('search-by-name-modal'));
      },

      'search by category': function () {
        assert.isDefined(registry.byId('search-by-category-modal'));
      }
    },

    'widgets open when the corresponding button/link is clicked': {
      'search by name': {
        'navbar link': function () {
          var dfd;

          dfd = this.async(1000);
          assert.isFalse(domClass.contains('search-by-name-modal', 'in'));
          dom.byId('search-by-name').dispatchEvent(new Event('click'));
          setTimeout(dfd.callback(function () {
            assert.isTrue(domClass.contains('search-by-name-modal', 'in'));
          }), 100);
        },

        'mobile link': function () {
          var dfd;

          dfd = this.async(1000);
          assert.isFalse(domClass.contains('search-by-name-modal', 'in'));
          dom.byId('searchField').dispatchEvent(new Event('click'));
          setTimeout(dfd.callback(function () {
            assert.isTrue(domClass.contains('search-by-name-modal', 'in'));
          }), 100);
        }
      },

      'search by category': function () {
        var dfd;

        dfd = this.async(1000);
        assert.isFalse(domClass.contains('search-by-category-modal', 'in'));
        dom.byId('search-by-category').dispatchEvent(new Event('click'));
        setTimeout(dfd.callback(function () {
          assert.isTrue(domClass.contains('search-by-category-modal', 'in'));
        }), 100);

      },

      'layers modal': function () {
        var dfd;

        dfd = this.async(1000);
        assert.isFalse(domClass.contains('layers-modal', 'in'));
        dom.byId('layers-nav').dispatchEvent(new Event('click'));
        setTimeout(dfd.callback(function () {
          assert.isTrue(domClass.contains('layers-modal', 'in'));
        }), 100);
      },

      'featured places mobile': function () {
        var dfd;

        dfd = this.async(1000);
        isMobileStub.restore();
        isMobileStub = sinon.stub(VTNavbar.prototype, 'isMobile', function () {
          return true;
        });
        vtNavbar.map.destroy();
        vtNavbar.destroy();
        navbarFixture = helpers.createFixture('vt-navbar');
        vtNavbar = new VTNavbar({
          map: bootstrapMap.create('vt-campus-map', config.map),
          layerInfos: config.layerInfos,
          layers: [],
          markerSymbol: {},
          borderSymbol: {}
        }, 'vt-navbar');
        assert.isFalse(domClass.contains('featured-places-modal', 'in'));
        dom.byId('featured-nav').dispatchEvent(new Event('click'));
        setTimeout(dfd.callback(function () {
          assert.isTrue(domClass.contains('featured-places-modal', 'in'));
        }), 100);
      },

      'legend modal': function () {
        var dfd;

        dfd = this.async(1000);
        assert.isFalse(domClass.contains('legend-modal', 'in'));
        dom.byId('legend-nav').dispatchEvent(new Event('click'));
        setTimeout(dfd.callback(function () {
          assert.isTrue(domClass.contains('legend-modal', 'in'));
        }), 100);
      },

      'about modal': function () {
        var dfd;

        dfd = this.async(1000);
        assert.isFalse(domClass.contains('about-modal', 'in'));
        dom.byId('about-nav').dispatchEvent(new Event('click'));
        setTimeout(dfd.callback(function () {
          assert.isTrue(domClass.contains('about-modal', 'in'));
        }), 100);
      },
    },

    'clicking on legend sends info to ga analytics': function () {
      var dfd, ga_stub;

      ga_stub = sinon.stub(ga, 'report');
      dfd = this.async(1000);
      dom.byId('legend-nav').dispatchEvent(new Event('click'));
      setTimeout(dfd.callback(function () {
        var args;

        assert.isTrue(ga_stub.calledOnce);
        args = ga_stub.getCall(0).args;
        assert.lengthOf(args, 1);
        assert.strictEqual(args[0], ga.actions.SEL_LEGEND);
        ga_stub.restore();
      }), 100);
    },

    'selecting a featured place identifies the place and sends info to google analytics': function () {
      var dfd, ga_stub, identify_stub;

      ga_stub = sinon.stub(ga, 'report');
      identify_stub = sinon.stub(PlaceIdentifier.prototype, 'identify');
      dfd = this.async(1000);
      dojoQuery('#featured-places a')[0].dispatchEvent(helpers.clickEvent());
      setTimeout(dfd.callback(function () {
        var args;

        assert.isTrue(ga_stub.calledOnce);
        args = ga_stub.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], ga.actions.SEL_FEATURED_PLACE);
        assert.strictEqual(args[1], 'Ag Quad');
        ga_stub.restore();

        assert.isTrue(identify_stub.calledOnce);
        args = identify_stub.getCall(0).args;
        assert.lengthOf(args, 1);
        assert.strictEqual(args[0].type, 'point');
        assert.strictEqual(args[0].spatialReference.wkid, 102100);
        identify_stub.restore();
      }), 100);
    },

    'turning a layer on sends info to google analytics': function () {
      var dfd, ga_stub;

      ga_stub = sinon.stub(ga, 'report');
      dfd = this.async(1000);
      dojoQuery('#layers-modal a')[0].dispatchEvent(helpers.clickEvent());
      setTimeout(dfd.callback(function () {
        var args;

        assert.isTrue(ga_stub.calledOnce);
        args = ga_stub.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], ga.actions.TURNON_LAYER);
        assert.strictEqual(args[1], 'layer1');
        ga_stub.restore();
      }), 100);
    },

    'turning a layer off sends info to google analytics': function () {
      var dfd, ga_stub;

      ga_stub = sinon.stub(ga, 'report');
      dfd = this.async(1000);
      dojoQuery('#layers-modal a')[1].dispatchEvent(helpers.clickEvent());
      setTimeout(dfd.callback(function () {
        var args;

        assert.isTrue(ga_stub.calledOnce);
        args = ga_stub.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], ga.actions.TURNOFF_LAYER);
        assert.strictEqual(args[1], 'layer2');
        ga_stub.restore();
      }), 100);
    },

    'changing the basemap sends info to google analytics': function () {
      var dfd, ga_stub;

      ga_stub = sinon.stub(ga, 'report');
      dfd = this.async(1000);
      dojoQuery('#mapType-gallery img')[1].dispatchEvent(helpers.clickEvent());
      setTimeout(dfd.callback(function () {
        var args;

        assert.isTrue(ga_stub.calledOnce);
        args = ga_stub.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], ga.actions.SEL_MAP_TYPE);
        assert.strictEqual(args[1], 'Aerial Photo');
        ga_stub.restore();
      }), 100);
    }
  });
}); 
