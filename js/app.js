require([
  'dojo/topic',
  'app/config',
  'app/widgets/Map',
  'app/widgets/NavBar',
  'dojo/domReady!'
], function(topic, config, Map, NavBar) {
  var navBar, map;

  navBar = new NavBar({
    config: config
  }, 'navBarNode');
  navBar.startup();
  
  map = new Map({
    config: config
  }, 'mapNode');
  map.startup();

  topic.subscribe('basemap/set', function(args) {
    map.setBasemap(args.basemap);
  });
});
