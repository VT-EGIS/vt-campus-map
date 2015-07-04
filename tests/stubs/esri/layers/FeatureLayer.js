define([
  'dojo/_base/declare',
  'dojo/Deferred',
  'dojo/_base/lang',
  'dojo/Evented'
], function (declare, Deferred, lang, Evented) {
  return declare([Evented], {
    constructor: function (opts) {
      lang.mixin(this, opts);
      this._deferred = new Deferred();
      //Resolve immediately 
      this._deferred.resolve(this._data);
    },

    url: 'someUrl/FeatureServer/0',

    defaultVisibility: true,

    _data: {
      features: [
      {
        attributes: {
          attr0: '234',
          attr1: 'value1.1',
          attr2: 'value2.1'
        }
      },
      {
        attributes: {
          attr0: '34',
          attr1: 'value1.2',
          attr2: 'value2.2'
        }
      },
      {
        attributes: {
          attr0: '23',
          attr1: 'value1.3',
          attr2: 'value2.3'
        }
      }
      ]
    },

    queryFeatures: function () {
      return this._deferred.promise;
    },

    fields: [
      {
        name: 'COMPLAINT',
        domain: {
          codedValues: [
            {
              name: 'Drunk In Public',
              code: 'DIP'
            },
            {
              name: 'Missing Person',
              code: 'MP'
            },
            {
              name: 'Fire Department Response',
              code: 'Fire'
            }
          ]
        }
      },
      {
        name: 'COMMENTS',
        type: 'esriFieldTypeString',
        length: 50
      },
      {
        name: 'LOCATION',
        type: 'esriFieldTypeString',
        length: 20
      },
      {
        name: 'OFFICER',
        type: 'esriFieldTypeString',
        length: 50
      }
    ],

    add: function () {},

    applyEdits: function () {},

    getMap: function () {},

    setVisibility: function () {}
  });
});
