require([
  'dojo/topic',

  'app/config',
  'app/widget/Map',
  'app/widget/NavBar',

  'dojo/i18n!./js/nls/strings.js',

  'dojo/domReady!'],
function(
  topic,
  config, Map, NavBar,
  strings
) {
  'use strict';


	// start nav widget
  var navBar = new NavBar({
    config: config,
    strings: strings
  }, 'navBarNode');
  navBar.startup();
  
  
  // start map widget
  var map = new Map({
    config: config,
    strings: strings
  }, 'mapNode');
  map.startup();

  

  // set up topics
  topic.subscribe('basemap/set', function(args) {
    map.setBasemap(args.basemap);
  });

  // set page title
  window.document.title = strings.appTitle;
  
});

function formatContent(key,value,data){
		
		return key.replace("Null","");
	}



	/**
	* displays an animation of the image of a bike rack or bus stop that appears in the info window when the user clicks on one of these features
	*/
	/*function showFrame (origImg)
	{	
		myimg = document.getElementById("myimg");
		myimg.src = origImg.src;
		myimg.width = origImg.width*2;
		myimg.height = origImg.height*2;
	
		document.getElementById("imgFrame").style.display = "block";
	}*/
	///////////////////////////////////////////////////////////////
	/**
	* hides the image animation shown when one a user clicks on an image of a bike rack or bus stop
	*/
	/*function hideFrame ()
	{
		document.getElementById("imgFrame").style.display = "none";
	}*/