require([
  'app/config',
  'app/widgets/vt_campus_map',
  'app/widgets/vt_nav_bar',
  'dojo/domReady!'
], function(config, Map, NavBar) {
  var navBar, map;

  navBar = new NavBar({
    config: config
  }, 'navBarNode');
  navBar.startup();
  
  map = new Map({
    config: config
  }, 'mapNode');
  map.startup();
});
