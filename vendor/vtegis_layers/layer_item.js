define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_Container',
  'dojo/_base/lang',
  'dojo/query',
  'dojo/dom-class',
  'dojo/_base/array',
  'vtCampusMap/google_analytics_manager'
], function (declare, _WidgetBase, _TemplatedMixin, _Container, lang, 
             dojoQuery, domClass, array, ga) {
  return declare([_WidgetBase, _TemplatedMixin, _Container], {
    templateString: '<li><a href="#">${formattedName}</a></li>', 

    postMixInProperties: function () {
      this.formattedName = this.name; //TODO capitalize this
    },

    postCreate: function () {
      this.active ? this.activate() : this.deactivate();
      this.on('click', lang.hitch(this, '_processClick'));
    },

    // This either just changes the css styles or actually shows the 
    // layer on the map depending on the updateLayerVisibility flag
    activate: function (updateLayerVisibility) {
      var children;

      this.active = true;
      domClass.remove(dojoQuery('a', this.domNode)[0], 'hidden-layer');
      domClass.add(dojoQuery('a', this.domNode)[0], 'visible-layer');

      // Go down the tree
      if(updateLayerVisibility) {
        children = this.getChildren();

        // Not setting the updateLayerVisibility flag as the child is always a ul
        // handled by a LayerList which will set the updateLayerVisibility flag to
        // true by default during activate
        if(children.length) {
          array.forEach(children, function (child) { child.activate(); });
        } else {
          this.visibilityCtrl.showLayer(this);
        }
      }
    },

    // This either just changes the css styles or actually hides the 
    // layer on the map depending on the updateLayerVisibility flag
    deactivate: function (updateLayerVisibility) {
      var children;

      this.active = false;
      domClass.remove(dojoQuery('a', this.domNode)[0], 'visible-layer');
      domClass.add(dojoQuery('a', this.domNode)[0], 'hidden-layer');

      if(updateLayerVisibility) {
        children = this.getChildren();

        // Not setting the updateLayerVisibility flag as the child is always a ul
        // handled by a LayerList which will set the updateLayerVisibility flag to
        // false by default during deactivate
        if(children.length) {
          array.forEach(children, function (child) { child.deactivate(); });
        } else {
          this.visibilityCtrl.hideLayer(this);
        }
      }
    },

    toggle: function (updateLayerVisibility) {
      if(this.active) {
        this.deactivate(updateLayerVisibility);
        ga.report(ga.actions.TURNOFF_LAYER, this.name);
      } else {
        this.activate(updateLayerVisibility);
        ga.report(ga.actions.TURNON_LAYER, this.name);
      }
    },

    updateVisibility: function () {
      var activeChildren;

      activeChildren = array.filter(this.getChildren(), function (child) {
        return child.active;
      });

      if(activeChildren.length === 0) {
        this.deactivate(false);
      } else {
        this.activate(false);
      }
    },

    _processClick: function (evt) {
      evt.preventDefault();
    
      if(evt.target === dojoQuery('a', this.domNode)[0]) {
        // Process from top down
        this.toggle(true);
      } else {
        // Process from bottom up
        this.updateVisibility();
      }
    }
  });
});
