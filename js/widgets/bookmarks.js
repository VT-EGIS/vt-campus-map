define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/text!./templates/bookmark_item.html',
  'dojo/query',
  'dojo/on',
  'dojox/html/entities',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Evented'
], function (declare, _WidgetBase, domConstruct, bookmarkItemTemplate, query,
             on, entities, lang, array, Evented) {
  return declare([_WidgetBase, Evented], {
    constructor : function (opts, elementID) {
      this.elementID = elementID;
      lang.mixin(this, opts);
      this._bookmarkElements = [];
      this._bookmarkDict = {};
    },

    postCreate : function () {
      this.inherited(arguments);
      this._createBookmarkList();
      this._attachEventHandlers();
    },

    _attachEventHandlers : function () {
      on(this.domNode, 'a:click', lang.hitch(this, function (evt) {
        var bookmark, bookmarkName;

        bookmarkName = entities.decode(evt.target.innerHTML);
        this.emit('bookmarkSelected', bookmarkName);
        bookmark = this.getBookmark(bookmarkName);
        this.onClickHandler(bookmark.geometry);
      })); 

    },

    getBookmark : function (name) {
      return this._bookmarkDict[name];
    },

    _createBookmarkList : function () {
      var _this;

      _this = this;

      this._bookmarkElements = array.map(this.bookmarks, function (bookmark) {
        var bookmarkElement, templateString;

        templateString = lang.replace(bookmarkItemTemplate, {
          name : bookmark.name
        });

        bookmarkElement = domConstruct.create(domConstruct.toDom(templateString), null,
            _this.domNode);

        _this._bookmarkDict[bookmark.name] = bookmark;
        return bookmarkElement;

      });
    } 
  });
});
