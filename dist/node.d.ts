type ColorArray$1 = [number, number, number];
type ColorType$1 = "array" | "hex";
interface PaletteOptions$1<T extends ColorType$1 = ColorType$1> {
    quality?: number;
    colorType?: T;
}
declare class ColorThief$1 {
    protected _getPalette(imageData: ImageData, pixelCount: number, colorCount: number, opts?: PaletteOptions$1): ColorArray$1[];
    protected _getColor(imageData: ImageData, pixelCount: number, opts?: PaletteOptions$1): ColorArray$1;
}

type ColorArray = [number, number, number];
type ColorType = "array" | "hex";
interface PaletteOptions<T extends ColorType = ColorType> {
    quality?: number;
    colorType?: T;
}

/**
 *
 * image is the path to the file.
 *  It can be
 *  - a relative path
 *  - an http url
 *  - a data url
 *  - an [in-memory Buffer](http://nodejs.org/api/buffer.html).
 *
 */
type ImageType = string | {
    type: string;
    buffer: Buffer;
};
declare class ColorThief extends ColorThief$1 {
    private getImageData;
    getPalette(img: ImageType, colorCount: number, opt?: PaletteOptions<"array">): Promise<ColorArray[]>;
    getPalette(img: ImageType, colorCount: number, opt?: PaletteOptions<"hex">): Promise<string[]>;
    getColor(img: ImageType, opt?: PaletteOptions<"array">): Promise<ColorArray>;
    getColor(img: ImageType, opt?: PaletteOptions<"hex">): Promise<string>;
}

export { ColorThief as default };
