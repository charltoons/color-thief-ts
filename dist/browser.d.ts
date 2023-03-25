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

declare class ColorThief extends ColorThief$1 {
    private crossOrigin;
    constructor(opts?: {
        crossOrigin: boolean;
    });
    private asyncFetchImage;
    private getImageData;
    getPalette(sourceImage: HTMLImageElement, colorCount: number, opts?: PaletteOptions<"array">): ColorArray[];
    getPalette(sourceImage: HTMLImageElement, colorCount: number, opts?: PaletteOptions<"hex">): string[];
    getColor(sourceImage: HTMLImageElement, opts?: PaletteOptions<"array">): ColorArray;
    getColor(sourceImage: HTMLImageElement, opts?: PaletteOptions<"hex">): string;
    getPaletteAsync(imageUrl: string, colorCount: number, opts?: PaletteOptions<"array">): Promise<ColorArray[]>;
    getPaletteAsync(imageUrl: string, colorCount: number, opts?: PaletteOptions<"hex">): Promise<string[]>;
    getColorAsync(imageUrl: string, opts?: PaletteOptions<"array">): Promise<ColorArray>;
    getColorAsync(imageUrl: string, opts?: PaletteOptions<"hex">): Promise<string>;
}

export { ColorThief as default };
