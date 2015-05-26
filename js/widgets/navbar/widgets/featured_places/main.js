define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/text!./template.html',
  'dojo/query',
  'dojo/on',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Evented',
  'vtCampusMap/google_analytics_manager',
  'esri/geometry/webMercatorUtils',
  'esri/geometry/Point',
  'dojo/NodeList-manipulate'
], function (declare, _WidgetBase, domConstruct, featuredPlaceItemTemplate, query,
             on, lang, array, Evented, ga, webMercatorUtils, Point) {
  return declare([_WidgetBase, Evented], {
    constructor : function () {
      this.featuredPlaceElements = [];
      this.featuredPlaceDict = {};
    },

    postCreate : function () {
      this.createFeaturedPlaceList();
      this.attachEventHandlers();
    },

    attachEventHandlers : function () {
      on(this.domNode, 'a:click', lang.hitch(this, function (evt) {
        var featuredPlace, name;

        evt.preventDefault();
        name = query(evt.target).text().trim();
        featuredPlace = this.featuredPlaceDict[name];
        ga.report(ga.actions.SEL_FEATURED_PLACE, name);
        this.placeIdentifier.identify(featuredPlace.geometry);
      })); 
    },

    createFeaturedPlaceList : function () {
      this.featuredPlaceElements = array.map(this.featuredPlaces, lang.hitch(this, function (featuredPlace) {
        var featuredPlaceElement, templateString, point;

        templateString = lang.replace(featuredPlaceItemTemplate, { name : featuredPlace.name });
        featuredPlaceElement = domConstruct.place(domConstruct.toDom(templateString), this.domNode);
        point = new Point(featuredPlace.geometry.lng, featuredPlace.geometry.lat);
        featuredPlace.geometry = webMercatorUtils.geographicToWebMercator(point);
        this.featuredPlaceDict[featuredPlace.name] = featuredPlace;

        return featuredPlaceElement;
      }));
    } 
  });
});
