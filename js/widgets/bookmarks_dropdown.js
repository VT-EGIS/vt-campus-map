define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/dom-construct',
  'dojo/text!./templates/bookmark_item.html',
  'dojo/query',
  'dojo/on',
  'dojox/html/entities'
], function (declare, _WidgetBase, domConstruct, bookmarkItemTemplate, query, on, entities) {
  return declare([_WidgetBase], {
    constructor : function (opts, elementID) {
      this.elementID = elementID;
      this._copyProperties(opts, this);
      this.attrs = {
        'class' : 'dropdown-menu',
        'role'  : 'menu'
      };
      this._copyProperties(opts.attrs, this.attrs);
      this._bookmarkElements = [];
      this._bookmarkDict = {};
      this._createBookmarkList();
    },

    postCreate : function () {
      this.inherited(arguments);
      this._attachEventHandlers();
    },

    _attachEventHandlers : function () {
      var dropDownListElement, _this;

      _this = this;
      dropDownListElement = query('.dropdown-menu', this.domNode);

      on(dropDownListElement, 'a:click', function (evt) {
        var bookmark, bookmarkName;

        bookmarkName = entities.decode(evt.target.innerHTML);
        bookmark = _this.getBookmark(bookmarkName);
        _this.onClickHandler.call(_this.mapContext, bookmark.lng, bookmark.lat);
      }); 

    },

    getBookmark : function (name) {
      return this._bookmarkDict[name];
    },

    /* Private Methods*/
    _copyProperties : function (opts, config) {
      var classListOpts, classListConfig, delimiter;

      delimiter = ' ';
      for(var property in opts) {
        if(opts.hasOwnProperty(property)) {
          if(property === 'class') {
            classListOpts = opts[property].split(delimiter);
            classListConfig = config[property].split(delimiter);
            config[property] = classListConfig.concat(classListOpts).join(delimiter);
          } else {
            config[property] = opts[property];
          }
        }
      }
    },
    
    _createBookmarkList : function () {
      var dropdownList, _this;

      _this = this;

      dropdownList = dojo.create('ul', this.attrs, this.elementID);

      this._bookmarkElements = dojo.map(this.bookmarks, function (bookmark) {
        var bookmarkElement, templateString;

        templateString = dojo.replace(bookmarkItemTemplate, {
          name : bookmark.name
        });

        bookmarkElement = dojo.create(domConstruct.toDom(templateString), null,
            dropdownList);

        _this._bookmarkDict[bookmark.name] = bookmark;
        return bookmarkElement;

      });
    } 
  });
});
