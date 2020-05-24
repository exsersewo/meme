const fetch = require("fetch-base64"),
  sharp = require("sharp"),
  baseFolder = "/images/",
  defaultImage =
    "https://vignette.wikia.nocookie.net/internet-meme/images/6/6e/Pogchamp.jpg";

async function modifyImage(imageUrl, position, rotate) {
  return new Promise(async (resolve, reject) => {
    if (imageUrl == undefined || position == undefined || rotate == undefined) {
      reject("Invalid Input");
    }
    await fetch
      .remote(imageUrl)
      .catch((reason) => reject(reason))
      .then(async (data) => {
        await sharp(Buffer.from(data[0], "base64"))
          .resize({ height: position.h, fit: sharp.fit.inside })
          .rotate(rotate === 0 ? 0 : rotate > 0 ? -position.r : position.r)
          .png()
          .toBuffer()
          .then((img) => resolve(img));
      });
  });
}

function manipImage(baseImage, buffer, img, template, position) {
  return new Promise((resolve, reject) => {
    sharp(img)
      .metadata()
      .catch((r) => reject(r))
      .then((info) => {
        var top = Math.abs(Math.round((position.h - info.height) / 2));
        var left = Math.abs(Math.round((position.w - info.width) / 2));

        baseImage = baseImage.composite([
          {
            input: buffer,
            gravity: "northwest",
            top: 0,
            left: 0,
            blend: "over",
          },
          {
            input: img,
            gravity: "northwest",
            top: position.y + top,
            left: position.x + left,
            blend: "over",
          },
        ]);

        resolve(baseImage);
      });
  });
}

function handleModification(
  baseImage,
  template,
  img,
  buffer,
  pos,
  isFinish,
  info,
  resolve
) {
  baseImage.toBuffer().then((buff) => {
    manipImage(baseImage, buff, img, template, pos).then((i) => {
      i.toBuffer().then((b) => {
        sharp({
          create: {
            width: info.width,
            height: info.height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 },
          },
        })
          .png()
          .toBuffer()
          .then((z) => {
            if (isFinish) {
              if (template.under === 1) {
                baseImage.composite([
                  {
                    input: z,
                    gravity: "northwest",
                    top: 0,
                    left: 0,
                    blend: "source",
                  },
                  {
                    input: b,
                    gravity: "northwest",
                    top: 0,
                    left: 0,
                    blend: "over",
                  },
                  {
                    input: buffer,
                    gravity: "northwest",
                    top: 0,
                    left: 0,
                    blend: "over",
                  },
                ]);
              } else if (template.under === 0) {
                baseImage.composite([
                  {
                    input: z,
                    gravity: "northwest",
                    top: 0,
                    left: 0,
                    blend: "source",
                  },
                  {
                    input: buffer,
                    gravity: "northwest",
                    top: 0,
                    left: 0,
                    blend: "over",
                  },
                  {
                    input: b,
                    gravity: "northwest",
                    top: 0,
                    left: 0,
                    blend: "over",
                  },
                ]);
              }
              resolve(baseImage);
            }
          });
      });
    });
  });
}

module.exports = async function (template, sources) {
  return new Promise(async (resolve, reject) => {
    var sourceCount = Object.keys(sources).length;
    var templateImage = __dirname + "/public" + baseFolder + template.image;

    await fetch.local(templateImage).then((data) => {
      var buffer = Buffer.from(data[0], "base64");
      var transform = sharp(buffer);

      transform
        .metadata()
        .catch((reason) => reject(reason))
        .then(async (info) => {
          var baseImage = sharp({
            create: {
              width: info.width,
              height: info.height,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
          }).png();

          if (sourceCount != 0) {
            if (sourceCount != template.sources) {
              var index = 0;

              for (var source in sources) {
                console.log(
                  `Processing Image: ${index} for template "${template.name}"`
                );
                var pos = template.position[index];
                var isFinish = x == template.position.length - 1;
                await modifyImage(sources[source], pos, template.rotate)
                  .catch((r) => reject(r))
                  .then((img) =>
                    handleModification(
                      baseImage,
                      template,
                      img,
                      buffer,
                      pos,
                      isFinish,
                      info,
                      resolve
                    )
                  );

                index++;
              }
            } else {
              for (var x = 0; x < template.position.length; x++) {
                console.log(
                  `Processing Image: ${x} for template "${template.name}"`
                );
                var pos = template.position[x];
                var isFinish = x == template.position.length - 1;
                var src = "source" + (x + 1);
                await modifyImage(sources[src], pos, template.rotate)
                  .catch((r) => reject(r))
                  .then((img) =>
                    handleModification(
                      baseImage,
                      template,
                      img,
                      buffer,
                      pos,
                      isFinish,
                      info,
                      resolve
                    )
                  );
              }
            }
          } else {
            for (var x = 0; x < template.position.length; x++) {
              console.log(
                `Processing Image: ${x} for template "${template.name}"`
              );
              var pos = template.position[x];
              var isFinish = x == template.position.length - 1;
              await modifyImage(defaultImage, pos, template.rotate)
                .catch((r) => reject(r))
                .then((img) =>
                  handleModification(
                    baseImage,
                    template,
                    img,
                    buffer,
                    pos,
                    isFinish,
                    info,
                    resolve
                  )
                );
            }
          }
        });
    });
  });
};
