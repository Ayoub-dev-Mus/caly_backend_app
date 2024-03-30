const { Appsignal } = require("@appsignal/nodejs");

new Appsignal({
  active: true,
  name: "caly_backend_app",
});
