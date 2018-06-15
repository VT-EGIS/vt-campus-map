// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	// A fully qualified URL to the Intern proxy
	proxyUrl: 'http://localhost:9000/',

	// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
	// specified browser environments in the `environments` array below as well. See
	// https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
	// https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
	// Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
	// automatically
	capabilities: {
		'selenium-version': '2.41.0'
	},

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		//{ browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
		//{ browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
		//{ browserName: 'internet explorer', version: '9', platform: 'Windows 7' },
		//{ browserName: 'firefox', version: '28', platform: [ 'OS X 10.9', 'Windows 7', 'Linux' ] },
		//{ browserName: 'chrome', version: '34', platform: [ 'OS X 10.9', 'Windows 7', 'Linux' ] },
		{ browserName: 'chrome', version: '43', platform: [ 'Linux' ] },
		//{ browserName: 'safari', version: '6', platform: 'OS X 10.8' },
		//{ browserName: 'safari', version: '7', platform: 'OS X 10.9' }
	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 3,

	// Name of the tunnel class to use for WebDriver tests
	tunnel: 'SauceLabsTunnel',

	// The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
	// loader
	useLoader: {
		'host-node': 'dojo/dojo',
		'host-browser': 'node_modules/dojo/dojo.js'
	},

	// Configuration options for the module loader; any AMD configuration options supported by the specified AMD loader
	// can be used here
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [
      { name: 'layersWidget', location: 'vendor/arcgis-layers-widget/src' },
      { name: 'featuredPlacesWidget', location: 'vendor/featured-places-widget/src' },
      { name: 'mapTypeGalleryWidget', location: 'vendor/arcgis-map-type-gallery/src' },
      { name: 'vtCampusMap', location: 'js' },
      { name: 'bootstrapMap', location: 'vendor/bootstrap-map/js'},
      { name: 'dojoBootstrap', location: 'vendor/Dojo-Bootstrap'},
      { name: 'dojo', location: 'lib/dojo'},
      { name: 'dojox', location: 'lib/dojox'},
      { name: 'dijit', location: 'lib/dijit'},
      { name: 'esri', location: 'lib/esri'},
      { name: 'vendor', location: 'vendor'}
    ],
    map : {
      'vtCampusMap/widgets/navbar/widgets/search_by_category/main': {
        'vtCampusMap/widgets/navbar/widgets/search_by_category/widgets/place_list_mgr/main': 'tests/stubs/place_list_mgr/main'
      },
      '*': {
        'esri/layers/FeatureLayer': 'tests/stubs/esri/layers/FeatureLayer'
      }
    }
	},

	// Non-functional test suite(s) to run in each browser
	suites: [
    'tests/exceptions_test.js',
    'tests/main_test.js',
    'tests/vt_campus_map_rpts_test.js',
    'tests/widgets/place_identifier/main_test',
    'tests/widgets/navbar/main_test',
    'tests/widgets/navbar/widgets/modal/main_test',
    'tests/widgets/navbar/widgets/search_by_category/main_test',
    'tests/widgets/navbar/widgets/search_by_category/widgets/place_list_mgr/main_test',
    'tests/widgets/navbar/widgets/search_by_category/widgets/place_list_mgr/widgets/place_list/main_test',
    'tests/widgets/navbar/widgets/search_by_name/main_test',
    'tests/widgets/map_info_manager/main_test'
  ],

	// Functional test suite(s) to run in each browser once non-functional tests are completed
	functionalSuites: [ /* 'myPackage/tests/functional' */ ],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(?:tests|node_modules|lib|vendor)\//
});
