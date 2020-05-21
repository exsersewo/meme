const express = require("express");
const templates = require("./data/templates.json");
const baseFolder = "/images/";
const defaultImage =
  "https://vignette.wikia.nocookie.net/internet-meme/images/6/6e/Pogchamp.jpg";
const app = express();
const port = 4000;
const appUrl = function (req) {
  return req.protocol + "://" + req.get("host");
};

function getEmptyRequest(req) {
  return (
    '<html><head><link rel="stylesheet" href="/css/home.css"></head><body><table>' +
    "<tr><td>Name</td><td>Sources Required</td><td>Usage</td><td>Template</td></tr>" +
    templates.map((x) => {
      var url = "/template/" + x.name + "/?";

      for (var z = 1; z <= x.sources; z++) {
        url += "source" + z + "=" + defaultImage;

        if (z != x.sources) {
          url += "&";
        }
      }

      return (
        "<tr><td>" +
        x.name +
        "</td>" +
        "<td>" +
        x.sources +
        "</td>" +
        '<td><a href="' +
        appUrl(req) +
        url +
        '">' +
        appUrl(req) +
        url +
        "</a></td>" +
        '<td><img src="' +
        baseFolder +
        x.image +
        '" width="320" /></td></tr>'
      );
    }) +
    "</table></body></html>"
  );
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200);
  res.contentType("text/html");
  res.send(getEmptyRequest(req));
});

app.get("/:template", async (req, res) => {
  res.status(200);
  res.send();
});

app.listen(port, () =>
  console.log(`Skuld.Meme listening at http://localhost:${port}`)
);
