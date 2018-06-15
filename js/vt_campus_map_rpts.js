define([], function () {
  var categories, actions;

  categories = {
    MAP_OBJ_SEL  : 'Map Object Selection',
    MAP_VIEW_CTL : 'Map View Control',
    MAP_HELP     : 'Map Help'
  };

  actions = {
    SEL_SEARCHCAT_CAT : {
      name: 'Select Search-Category Category',
      category: categories.MAP_OBJ_SEL
    },
    SEL_FEATURED_PLACE : {
      name: 'Select Featured Place',
      category: categories.MAP_OBJ_SEL
    },
    SEL_MAP_PLACE : {
      name: 'Select Map Place',
      category: categories.MAP_OBJ_SEL
    },
    SEL_SEARCHCAT_PLACE : {
      name: 'Select Search-Category Place',
      category: categories.MAP_OBJ_SEL
    },
    SEL_SEARCHNAME_PLACE : {
      name: 'Select Search-Name Place',
      category: categories.MAP_OBJ_SEL
    },
    SEL_MAP_TYPE : {
      name: 'Select Map Type',
      category: categories.MAP_VIEW_CTL
    },
    TURNON_LAYER : {
      name: 'Turn-On Layer',
      category: categories.MAP_VIEW_CTL
    },
    TURNOFF_LAYER : {
      name: 'Turn-Off Layer',
      category: categories.MAP_VIEW_CTL
    },
    SEL_LEGEND: {
      name: 'Select Legend',
      category: categories.MAP_HELP
    },
    SEL_ABOUT: {
      name: 'Select About',
      category: categories.MAP_HELP
    }
  };

  return {
    actions: actions,

    report: function (action, value) {
      __gaTracker('send', 'event', action.category, action.name, value); 
    }
  };
});
