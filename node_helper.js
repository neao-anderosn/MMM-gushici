var NodeHelper = require("node_helper");
var http = require('http');
const Log = require("logger");

module.exports = NodeHelper.create({
  // Subclass start method.
  start: function () {
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "getJson_s") {
      var self = this;
      var body = "";

      http.get(payload, (response) => {
        response.on('data', d => {
          body += d
        })

        response.on('end', () => {
          if (response.statusCode == 200) {
            self.sendSocketNotification("getJson_r", body)
          }
        })
      }).on('error', error => {
        Log.error(error)
      })
    }
  }
});