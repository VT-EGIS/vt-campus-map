define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/text!./templates/bookmark_item.html',
  'dojo/query',
  'dojo/on',
  'dojox/html/entities'
], function (declare, _WidgetBase, domConstruct, bookmarkItemTemplate, query,
             on, entities) {
  return declare([_WidgetBase], {
    constructor : function (opts, elementID) {
      this.elementID = elementID;
      this._copyProperties(opts, this);
      this._copyProperties(opts.attrs, this.attrs);
      this._bookmarkElements = [];
      this._bookmarkDict = {};
    },

    postCreate : function () {
      this.inherited(arguments);
      this._createBookmarkList();
      this._attachEventHandlers();
    },

    _attachEventHandlers : function () {
      var _this;

      _this = this;

      on(this.domNode, 'a:click', function (evt) {
        var bookmark, bookmarkName;

        bookmarkName = entities.decode(evt.target.innerHTML);
        bookmark = _this.getBookmark(bookmarkName);
        _this.onClickHandler.call(_this.mapContext, bookmark.geometry);
      }); 

    },

    getBookmark : function (name) {
      return this._bookmarkDict[name];
    },

    _copyProperties : function (configItem) {
      for(var property in configItem) {
        if(configItem.hasOwnProperty(property)) {
          this[property] = configItem[property];
        }
      }
    },

    _createBookmarkList : function () {
      var _this;

      _this = this;

      this._bookmarkElements = dojo.map(this.bookmarks, function (bookmark) {
        var bookmarkElement, templateString;

        templateString = dojo.replace(bookmarkItemTemplate, {
          name : bookmark.name
        });

        bookmarkElement = dojo.create(domConstruct.toDom(templateString), null,
            _this.domNode);

        _this._bookmarkDict[bookmark.name] = bookmark;
        return bookmarkElement;

      });
    } 
  });
});
