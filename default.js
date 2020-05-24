const baseFolder = "/images/",
  defaultImage =
    "https://vignette.wikia.nocookie.net/internet-meme/images/6/6e/Pogchamp.jpg";

function appUrl(req) {
  return req.protocol + "://" + req.get("host");
}

module.exports = function (req, templates) {
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
};
