import { groupWordsByWidth } from "@/utils/schema-converter";
import * as PIXI from "pixi.js";

interface CaptionClipOptions {
  videoWidth: number;
  videoHeight: number;
  words: any[];
  fontSize?: number;
  fontFamily?: string;
  fontUrl?: string;
  mode?: "single" | "multiple";
  style?: any;
}

/**
 * Generate caption clips from transcription words
 */
export async function generateCaptionClips(options: CaptionClipOptions): Promise<any[]> {
  const {
    videoWidth,
    videoHeight,
    words,
    fontSize = 80,
    fontFamily = "Bangers-Regular",
    fontUrl = "https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLCz7V1tvFP-KUEg.ttf",
    mode = "multiple",
  } = options;

  const maxCaptionWidth = videoWidth * 0.8;
  let captionChunks: any[] = [];

  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  const ctx = canvas?.getContext("2d");
  if (ctx) {
    ctx.font = `${fontSize}px ${fontFamily}`;
  }

  const measureText = (text: string) => {
    if (!ctx) return { width: 0, height: fontSize };
    const metrics = ctx.measureText(text);
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return {
      width: metrics.width,
      height: height || fontSize,
    };
  };
  const maxLines = options.style?.textBoxStyle?.maxLines ?? 1;
  const verticalPadding = options.style?.textBoxStyle?.verticalPadding ?? 0;

  if (mode === "single") {
    // Each word is a chunk
    captionChunks = words.map((word) => {
      const text = word.word || word.text || "";
      const dims = measureText(text);
      const bitmapText = new PIXI.BitmapText(text, {
        fontFamily,
        fontSize,
      });
      const testWidth = bitmapText.width + 60;
      return {
        text,
        from: word.start || word.from / 1000,
        to: word.end || word.to / 1000,
        width: testWidth,
        height: dims.height,
        words: [
          {
            text,
            from: 0,
            to: ((word.end || word.to / 1000) - (word.start || word.from / 1000)) * 1000,
            isKeyWord: true,
            paragraphIndex: word.paragraphIndex ?? 0,
          },
        ],
      };
    });
  } else {
    captionChunks = groupWordsByWidth(words, maxCaptionWidth, fontSize, fontFamily, maxLines);
  }

  const clips: any[] = [];

  const maxCaptionHeight = captionChunks.reduce((max, chunk) => {
    const jumpLines = (chunk.text.match(/\r?\n/g) || []).length;

    const captionHeight =
      Math.ceil(chunk.height) + (jumpLines + 1) * verticalPadding * 2 + 14 * (jumpLines + 1);

    return Math.max(max, captionHeight);
  }, 0);

  for (const chunk of captionChunks) {
    const chunkFromMs = chunk.from * 1000; // seconds to ms
    const chunkToMs = chunk.to * 1000;
    const chunkDurationMs = chunkToMs - chunkFromMs;

    const fromUs = chunkFromMs * 1000; // ms to μs
    const toUs = chunkToMs * 1000;
    const durationUs = chunkDurationMs * 1000;

    // Use actual measured dimensions from chunk, with padding
    const captionWidth = Math.ceil(chunk.width) + (mode === "single" ? 60 : 0);
    const jumpLines = (chunk.text.match(/\r?\n/g) || []).length;
    const captionHeight =
      Math.ceil(chunk.height) + (jumpLines + 1) * verticalPadding * 2 + 14 * (jumpLines + 1);
    const captionBottomPadding = 450 - (maxCaptionHeight - captionHeight) / 2;
    const compactWords = chunk.words.map((w: any) => {
      const word: any = {
        text: w.text,
        from: Math.round(w.from * 10) / 10,
        to: Math.round(w.to * 10) / 10,
      };
      if (w.isKeyWord) word.isKeyWord = true;
      if (w.paragraphIndex != null && w.paragraphIndex !== "" && w.paragraphIndex !== 0)
        word.paragraphIndex = w.paragraphIndex;
      return word;
    });

    clips.push({
      type: "Caption",
      timing: {
        display: {
          from: fromUs,
          to: toUs,
        },
      },
      left: (videoWidth - captionWidth) / 2,
      top:
        options.style?.verticalAlign === "top"
          ? 80
          : options.style?.verticalAlign === "center"
            ? (videoHeight - captionHeight) / 2
            : videoHeight - captionBottomPadding,
      width: captionWidth,
      height: captionHeight,
      text: chunk.text,
      caption: {
        words: compactWords,
      },
    });
  }

  return clips;
}
