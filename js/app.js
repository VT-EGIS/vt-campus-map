require([
  'app/config',
  'app/widgets/vt_campus_map',
  'app/widgets/vt_nav_bar',
  'dojo/domReady!'
], function(config, VTMap, NavBar) {
  var navBar, vtMap;

  vtMap = new VTMap({
    config: config
  }, 'mapNode');
  vtMap.startup();

  navBar = new NavBar({
    map: vtMap.getMap(),
    mapTypes : config.map.mapTypes,
    moreInfoUrl : config.about.moreInfoUrl,
    featuredPlaces : config.map.featuredPlaces,
    onClickHandler : vtMap.getOnClickHandler() 
  }, 'navBarNode');
  navBar.startup();
});
