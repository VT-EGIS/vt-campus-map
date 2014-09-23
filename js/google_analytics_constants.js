define([], function () {
  var constants, labels, categories, actions, values;

  actions = {
    TOUCH : 'touch'
  };

  categories = {
    ABOUT       : 'About',
    LAYERS      : 'Layers',
    LEGEND      : 'Legend',
    MAP_TYPE    : 'Map Type',
    FEATURED    : 'Featured',
    FIND_PLACES : 'Find Places',
    SEARCH_NAME : 'Search by Name',
    SEARCH_CATEGORY : 'Search by Category'
  };

  labels = {
    LINK         : 'Link',
    NAV_DROPDOWN : 'Navigation Dropdown'
  };

  values = {};

  constants = {
    SEND  : 'send',
    EVENT : 'event'
  };

  return {
    getLbl : function (name) {
      if(labels[name]) {
        return labels[name];
      } else {
        throw {
          name : 'Invalid Label',
          message : name + ' is not a valid google analytics label'
        };
      }
    },
    getCat : function (name) {
      if(categories[name]) {
        return categories[name];
      } else {
        throw {
          name : 'Invalid Category',
          message : name + ' is not a valid google analytics category'
        };
      }
    },
    getAct : function (name) {
      if(actions[name]) {
        return actions[name];
      } else {
        throw {
          name : 'Invalid Action',
          message : name + ' is not a valid google analytics action'
        };
      }
    },
    getCst : function (name) {
      if(constants[name]) {
        return constants[name];
      } else {
        throw {
          name : 'Invalid Constant',
          message : name + ' is not a valid google analytics constant'
        };
      }
    }
  };
});
