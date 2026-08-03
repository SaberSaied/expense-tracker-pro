declare module "pdfkit" {
  import { EventEmitter } from "node:events";
  import { Writable } from "node:stream";

  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
    layout?: "portrait" | "landscape";
    info?: Record<string, string>;
    autoFirstPage?: boolean;
    bufferPages?: boolean;
    compress?: boolean;
    pdfVersion?: string;
    tagged?: boolean;
    displayTitle?: string;
    lang?: string;
    userPassword?: string;
    ownerPassword?: string;
    permissions?: Record<string, boolean>;
  }

  interface TextOptions {
    continued?: boolean;
    width?: number;
    height?: number;
    align?: "left" | "center" | "right" | "justify";
    baseline?: "top" | "bottom" | "middle" | "alphabetic" | "hanging";
    indent?: number;
    lineBreak?: boolean;
    underline?: boolean;
    strike?: boolean;
    link?: string;
    goTo?: string;
    characterSpacing?: number;
    wordSpacing?: number;
    columns?: number;
    columnGap?: number;
    paragraphGap?: number;
    lineGap?: number;
    listType?: "bullet" | "numbered" | undefined;
    bulletIndent?: number;
    textIndent?: number;
    features?: unknown[];
    opacity?: number;
    oblique?: boolean;
    fill?: boolean;
    stroke?: boolean;
  }

  interface ImageOptions {
    width?: number;
    height?: number;
    fit?: [number, number];
    cover?: [number, number];
    align?: "center" | "left" | "right";
    valign?: "center" | "top" | "bottom";
    scale?: number;
    link?: string;
    goTo?: string;
  }

  interface ListOptions {
    listType?: "bullet" | "numbered";
    bulletIndent?: number;
    textIndent?: number;
    fontSize?: number;
  }

  interface PDFDocument extends Writable {
    // Font & text
    font(font: string, size?: number): this;
    fontSize(size: number): this;
    widthOfString(
      text: string,
      options?: {
        font?: string;
        fontSize?: number;
        characterSpacing?: number;
        wordSpacing?: number;
        features?: unknown[];
      },
    ): number;
    heightOfString(text: string, options?: TextOptions): number;
    text(
      text: string,
      x?: number | TextOptions,
      y?: number | TextOptions,
      options?: TextOptions,
    ): this;
    text(text: string, options?: TextOptions): this;

    // Position
    x: number;
    y: number;
    page: {
      width: number;
      height: number;
      margins: { top: number; bottom: number; left: number; right: number };
    };
    pageCount: number;
    lineCap(cap: "butt" | "round" | "square"): this;
    lineJoin(join: "miter" | "round" | "bevel"): this;

    // Navigation
    addPage(options?: PDFDocumentOptions): this;
    addContent(data: unknown): void;
    moveDown(lines?: number): this;
    moveUp(lines?: number): this;

    // Style
    fillColor(color: string): this;
    strokeColor(color: string): this;
    fillOpacity(opacity: number): this;
    strokeOpacity(opacity: number): this;
    lineWidth(width: number): this;
    opacity(opacity: number): this;
    dash(length: number, options?: { space?: number }): this;
    undash(): this;
    save(): this;
    restore(): this;

    // Path shapes
    rect(x: number, y: number, width: number, height: number): this;
    roundedRect(x: number, y: number, width: number, height: number, radius: number): this;
    circle(x: number, y: number, radius: number): this;
    ellipse(x: number, y: number, xRadius: number, yRadius: number): this;
    polygon(...points: number[][]): this;
    path(path: string): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    curveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
    closePath(): this;
    fill(color?: string, rule?: "even-odd" | "non-zero"): this;
    stroke(color?: string): this;
    fillAndStroke(fillColor?: string, strokeColor?: string): this;
    clip(rule?: "even-odd" | "non-zero"): this;
    endPath(): this;

    // Images
    image(path: string | Buffer, x?: number, y?: number, options?: ImageOptions): this;
    image(path: string | Buffer, options?: ImageOptions): this;

    // Lists
    list(list: string[], x?: number, y?: number, options?: ListOptions): this;

    // Font registration
    registerFont(name: string, src: string, options?: { family?: string; weight?: string }): this;

    // Events (from EventEmitter via Writable)
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;

    // Pipe (from Writable)
    pipe<T extends Writable>(destination: T): T;

    // End
    end(): void;
  }

  const PDFDocument: {
    new (options?: PDFDocumentOptions): PDFDocument;
    (options?: PDFDocumentOptions): PDFDocument;
  };

  export default PDFDocument;
}
