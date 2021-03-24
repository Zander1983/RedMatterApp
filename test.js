const axios = require("axios");

const payload = {
  email: "markkelly1983@yahoo.co.uk",
  password: "password",
};

const url =
  "http://integration6.eba-mdppjui3.us-east-1.elasticbeanstalk.com/api/login";

const headers = {
  "Content-Type": "application/json",
};

axios
  .post(url, payload, { headers: headers })
  .then((e) => console.log(e))
  .catch((e) => console.log(e));
