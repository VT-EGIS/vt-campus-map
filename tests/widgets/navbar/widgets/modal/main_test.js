define([
  'intern!object',
  'intern/chai!assert',
  'vtCampusMap/widgets/navbar/widgets/modal/main',
  'dojo/dom-class',
  'dojo/query',
  'dojo/NodeList-manipulate'
], function (registerSuite, assert, Modal, domClass, dojoQuery) {
  var modal;

  registerSuite({
    name: 'Modal',

    beforeEach: function () {
      modal = new Modal();
      document.body.appendChild(modal.domNode);
    },

    afterEach: function () {
      modal.destroy();
    },

    'creates a modal': function () {
      assert.isTrue(domClass.contains(modal.domNode, 'modal'));
    },

    'setTitle': function () {
      assert.strictEqual(dojoQuery('.modal-title', modal.domNode).text().trim(), '');
      modal.setTitle('My Title');
      assert.strictEqual(dojoQuery('.modal-title', modal.domNode).text().trim(), 'My Title');
    },

    'setBody': function () {
      assert.strictEqual(dojoQuery('.modal-body', modal.domNode).html().trim(), '<div></div>');
      modal.setBody('<p> This is a paragraph </p>');
      assert.strictEqual(dojoQuery('.modal-body', modal.domNode).html().trim(), '<p> This is a paragraph </p>');
    },

    'getBody': function () {
      assert.strictEqual(dojoQuery('.modal-body div', modal.domNode)[0], modal.getBody());
    },

    'open': function () {
      assert.isFalse(domClass.contains(modal.domNode, 'in'));
      modal.open();
      assert.isTrue(domClass.contains(modal.domNode, 'in'));
    },

    'close': function () {
      modal.open();
      assert.isTrue(domClass.contains(modal.domNode, 'in'));
      modal.close();
      assert.isFalse(domClass.contains(modal.domNode, 'in'));
    },
  });
}); 
