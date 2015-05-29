define([
    'intern!object',
    'intern/chai!assert',
    'tests/helpers',
    'vtCampusMap/widgets/navbar/widgets/about/main',
    'dojo/text!vtCampusMap/widgets/navbar/widgets/about/content.html',
    'dojo/query',
    'dojo/NodeList-manipulate'
], function (registerSuite, assert, helpers, AboutModal, aboutText, dojoQuery) {
  var aboutFixture, aboutModal;

  registerSuite({
    name: 'About Modal',

    beforeEach: function () {
      aboutFixture = helpers.createFixture('about-modal');
      aboutModal = new AboutModal({}, 'about-modal');
    },

    afterEach: function () {
      aboutModal.destroy();
      aboutFixture.remove();
    },

    'has the correct title': function () {
      assert.strictEqual(dojoQuery('.modal-title').text(), 'About');
    },

    'has the correct body': function () {
      assert.include(dojoQuery('.modal-body').text(), 'At this time, street address searches require the exact address in order');
    }
  });
}); 
