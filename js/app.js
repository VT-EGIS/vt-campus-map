require([
  'dojo/topic',
  'app/config',
  'app/widget/Map',
  'app/widget/NavBar',
  'dojo/domReady!'
], function(topic, config, Map, NavBar) {
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
