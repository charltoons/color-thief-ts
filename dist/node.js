// src/node.ts
import getPixels from "get-pixels";

// src/core.ts
import quantize from "quantize";

// src/utils/createPixelArray.ts
function createPixelArray(imgData, pixelCount, quality) {
  const pixels = imgData;
  const pixelArray = [];
  for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
    offset = i * 4;
    r = pixels[offset + 0];
    g = pixels[offset + 1];
    b = pixels[offset + 2];
    a = pixels[offset + 3];
    if (typeof a === "undefined" || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArray.push([r, g, b]);
      }
    }
  }
  return pixelArray;
}

// src/utils/validateOptions.ts
function validateOptions(options) {
  let { colorCount, quality } = options;
  if (typeof colorCount === "undefined" || !Number.isInteger(colorCount)) {
    colorCount = 10;
  } else if (colorCount === 1) {
    throw new Error(
      "colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()"
    );
  } else {
    colorCount = Math.max(colorCount, 2);
    colorCount = Math.min(colorCount, 20);
  }
  if (typeof quality === "undefined" || !Number.isInteger(quality) || quality < 1) {
    quality = 10;
  }
  return {
    colorCount,
    quality
  };
}

// src/core.ts
var DEFAULT_QUALITY = 10;
var ColorThief = class {
  /*
   * getPalette(sourceImage[, colorCount, quality])
   * returns array[ {r: num, g: num, b: num}, {r: num, g: num, b: num}, ...]
   *
   * Use the median cut algorithm provided by quantize.js to cluster similar colors.
   *
   * colorCount determines the size of the palette; the number of colors returned. If not set, it
   * defaults to 10.
   *
   * quality is an optional argument. It needs to be an integer. 1 is the highest quality settings.
   * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
   * faster the palette generation but the greater the likelihood that colors will be missed.
   *
   *
   */
  _getPalette(imageData, pixelCount, colorCount, opts) {
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    const options = validateOptions({
      colorCount,
      quality: (opts == null ? void 0 : opts.quality) ?? DEFAULT_QUALITY
    });
    const pixelArray = createPixelArray(
      imageData.data,
      pixelCount,
      options.quality
    );
    const cmap = quantize(pixelArray, options.colorCount);
    const palette = cmap ? cmap.palette() : [];
    return palette;
  }
  /*
   * getColor(sourceImage[, quality])
   * returns {r: num, g: num, b: num}
   *
   * Use the median cut algorithm provided by quantize.js to cluster similar
   * colors and return the base color from the largest cluster.
   *
   * Quality is an optional argument. It needs to be an integer. 1 is the highest quality settings.
   * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
   * faster a color will be returned but the greater the likelihood that it will not be the visually
   * most dominant color.
   *
   * */
  _getColor(imageData, pixelCount, opts) {
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    const palette = this._getPalette(imageData, pixelCount, 5, {
      quality: (opts == null ? void 0 : opts.quality) ?? DEFAULT_QUALITY,
      colorType: "array"
    });
    const dominantColor = (palette == null ? void 0 : palette[0]) ?? null;
    if (dominantColor === null) {
      return dominantColor;
    }
    return dominantColor;
  }
};
var core_default = ColorThief;

// src/utils/arrayToHex.ts
function arrayToHex(color) {
  const hexCode = "#" + color.map(function(colorCode) {
    return colorCode.toString(16).padStart(2, "0");
  }).join("");
  return hexCode;
}

// src/node.ts
var ColorThief2 = class extends core_default {
  getImageData(img) {
    return new Promise((resolve, reject) => {
      if (typeof img === "string") {
        getPixels(img, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve([data, data.shape[0] * data.shape[1]]);
          }
        });
      } else {
        getPixels(img.buffer, img.type, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve([data, data.shape[0] * data.shape[1]]);
          }
        });
      }
    });
  }
  getPalette(img, colorCount = 10, opts) {
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    return new Promise((resolve, reject) => {
      this.getImageData(img).then(([imageData, pixelCount]) => {
        const palette = this._getPalette(
          imageData,
          pixelCount,
          colorCount,
          opts
        );
        if (colorType === "hex") {
          return resolve(palette.map((item) => arrayToHex(item)));
        }
        return resolve(palette);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  getColor(img, opts) {
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    return new Promise((resolve, reject) => {
      this.getPalette(img, 5, {
        quality: (opts == null ? void 0 : opts.quality) ?? 10,
        colorType: "array"
      }).then((palette) => {
        if (colorType === "hex") {
          return resolve(arrayToHex(palette[0]));
        }
        return resolve(palette[0]);
      }).catch((err) => {
        reject(err);
      });
    });
  }
};
var node_default = ColorThief2;
export {
  node_default as default
};
