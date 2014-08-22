require([
  'dojo/topic',
  'app/config',
  'app/widgets/Map',
  'app/widgets/NavBar',
  'dojo/i18n!./js/nls/strings.js',
  'dojo/domReady!'
], function(topic, config, Map, NavBar, strings) {
  var navBar, map;

  navBar = new NavBar({
    config: config,
    strings: strings
  }, 'navBarNode');
  navBar.startup();
  
  map = new Map({
    config: config,
    strings: strings
  }, 'mapNode');
  map.startup();

  topic.subscribe('basemap/set', function(args) {
    map.setBasemap(args.basemap);
  });
});
