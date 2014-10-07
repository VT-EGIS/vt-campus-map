define([], function () {
  var constants, categories, actions, values;

  categories = {
    MAP_OBJ_SEL  : 'Map Object Selection',
    MAP_VIEW_CTL : 'Map View Control'
  };

  actions = {
    SEL_SEARCHCAT_CAT    : 'Select Search-Category Category',
    SEL_FEATURED_PLACE   : 'Select Featured Place',
    SEL_MAP_PLACE        : 'Select Map Place',
    SEL_SEARCHCAT_PLACE  : 'Select Search-Category Place',
    SEL_SEARCHNAME_PLACE : 'Select Search-Name Place',
    SEL_MAP_TYPE         : 'Select Map Type',
    TURNON_LAYER         : 'Turn-On Layer',
    TURNOFF_LAYER        : 'Turn-Off Layer'
  };

  values = {};

  constants = {
    SEND  : 'send',
    EVENT : 'event'
  };

  return {
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
