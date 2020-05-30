require("dotenv").config();
const express = require("express"),
  modifyimage = require("./imageManipulation"),
  emptyRequest = require("./default"),
  app = express(),
  port = process.env.API_PORT || 4000;

//https://stackoverflow.com/a/1179377
function strcmp(str1, str2) {
  return str1 == str2 ? 0 : str1 > str2 ? 1 : -1;
}

var templates = require("./data/templates.json");

templates = templates.sort((x, y) => strcmp(x.name, y.name));

function replacer(key, value) {
  // Filtering out properties
  if (value === null) {
    return undefined;
  }
  return value;
}

function getResponse(wasSuccess, data, reason) {
  return JSON.stringify(
    {
      success: wasSuccess,
      data: data,
      reason: reason,
    },
    replacer,
    4
  );
}

app.use(express.static("public"));

app.use((req, res, next) => {
  console.log(`Request Received: ${new Date()}`);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.status(200);
  res.contentType("text/html");
  res.send(emptyRequest(req, templates));
});

app.get("/template/:template/random", (req, res) => {
  var templateName = req.params["template"];
  var template = templates.find((x) => x.name == templateName);
  if (template == null) {
    res.status(400);
    res.send(
      getResponse(
        false,
        null,
        "Malformed Request; Template '" +
          templateName +
          "' not found. Double check input and try again"
      )
    );
  } else {
    res.status(200);
    res.send();
  }
});

app.get("/template/:template", async (req, res) => {
  var templateName = req.params["template"];
  var template = templates.find((x) => x.name == templateName);
  if (template == null) {
    res.status(400);
    res.send(
      getResponse(
        false,
        null,
        "Malformed Request; Template '" +
          templateName +
          "' not found. Double check input and try again"
      )
    );
  } else {
    if (req.query === undefined) {
      res.status(400);
      res.send(
        getResponse(
          false,
          null,
          "Malformed Request; Sources not given. Double check input and try again"
        )
      );
    } else {
      var sourceCount = Object.keys(req.query).length;
      if (template.sources <= sourceCount) {
        await modifyimage(template, req.query)
          .catch((reason) => {
            console.log(reason);
            res.status(500);
            res.send(getResponse(false, null, "Internal Server Error"));
          })
          .then((image) => {
            if (image !== undefined) {
              res.contentType("png");
              res.status(200);
              image.png().pipe(res);
            }
          });
      } else {
        res.status(400);
        res.send(
          getResponse(
            false,
            null,
            "Malformed Request; Not enough sources given. Template '" +
              template.name +
              "' requires " +
              template.sources +
              " source images. Double check input and try again"
          )
        );
      }
    }
  }
});

app.listen(port, () =>
  console.log(`Skuld.Meme listening at http://localhost:${port}`)
);
