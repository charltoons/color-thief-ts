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

// src/browser.ts
var DEFAULT_QUALITY2 = 10;
var CanvasImage = class {
  constructor(image) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width = image.naturalWidth;
    this.height = this.canvas.height = image.naturalHeight;
    this.context.drawImage(image, 0, 0, this.width, this.height);
  }
  getImageData() {
    return this.context.getImageData(0, 0, this.width, this.height);
  }
};
var ColorThief2 = class extends core_default {
  constructor(opts) {
    super();
    this.crossOrigin = (opts == null ? void 0 : opts.crossOrigin) ?? false;
  }
  async asyncFetchImage(imageUrl) {
    const imageSource = await fetch(imageUrl, {
      method: "GET",
      headers: this.crossOrigin ? { "Access-Control-Allow-Origin": "*" } : void 0
    }).then(function(response) {
      if (response.ok) {
        return response.blob();
      }
      return null;
    }).then(function(blob) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(blob);
      return img;
    }).catch(function(error) {
      return null;
    });
    return new Promise((resolve, _reject) => {
      if (imageSource === null) {
        return resolve(imageSource);
      }
      imageSource.onload = function() {
        resolve(imageSource);
      };
    });
  }
  getImageData(sourceImage) {
    const image = new CanvasImage(sourceImage);
    const imageData = image.getImageData();
    const pixelCount = image.width * image.height;
    return [imageData, pixelCount];
  }
  getPalette(sourceImage, colorCount, opts) {
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    const [imageData, pixelCount] = this.getImageData(sourceImage);
    const palette = this._getPalette(imageData, pixelCount, colorCount, opts);
    if (colorType === "hex") {
      return palette.map((item) => arrayToHex(item));
    }
    return palette;
  }
  getColor(sourceImage, opts) {
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    const palette = this.getPalette(sourceImage, 5, {
      quality: (opts == null ? void 0 : opts.quality) ?? DEFAULT_QUALITY2,
      colorType: "array"
    });
    const dominantColor = (palette == null ? void 0 : palette[0]) ?? null;
    if (dominantColor === null) {
      return dominantColor;
    }
    if (colorType === "hex") {
      return arrayToHex(dominantColor);
    }
    return dominantColor;
  }
  getPaletteAsync(imageUrl, colorCount, opts) {
    const quality = (opts == null ? void 0 : opts.quality) ?? DEFAULT_QUALITY2;
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    return this.asyncFetchImage(imageUrl).then((sourceImage) => {
      if (sourceImage === null) {
        return { dominantColor: null, palette: [], image: sourceImage };
      }
      const palette = this.getPalette(sourceImage, colorCount, {
        quality,
        colorType: "array"
      });
      if (palette === null) {
        return { dominantColor: null, palette: [], image: sourceImage };
      }
      if (colorType === "hex") {
        return palette.map((item) => arrayToHex(item));
      }
      return palette;
    });
  }
  getColorAsync(imageUrl, opts) {
    const quality = (opts == null ? void 0 : opts.quality) ?? DEFAULT_QUALITY2;
    const colorType = (opts == null ? void 0 : opts.colorType) ?? "hex";
    return this.asyncFetchImage(imageUrl).then((sourceImage) => {
      if (sourceImage === null) {
        return { dominantColor: null, palette: [], image: sourceImage };
      }
      const palette = this.getPalette(sourceImage, 5, {
        quality,
        colorType: "array"
      });
      if (palette === null) {
        return { dominantColor: null, palette: [], image: sourceImage };
      }
      const dominantColor = palette[0];
      if (colorType === "hex") {
        return arrayToHex(dominantColor);
      }
      return dominantColor;
    });
  }
};
var browser_default = ColorThief2;
export {
  browser_default as default
};
