define([
  'dojo/_base/declare',
  '../modal/main',
  'dojo/text!./content.html'
], function (declare, Modal, content) {
  return declare([Modal], {
    postCreate: function () {
      this.inherited(arguments);
      this.setTitle('About');
      this.setBody(content);
    },

    startup: function () {
      this.dijit.startup();
    }
  });
});
