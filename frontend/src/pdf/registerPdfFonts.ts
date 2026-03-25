import { Font } from "@react-pdf/renderer";
// WOFF2 triggers RangeError: Offset is outside the bounds of the DataView in fontkit (react-pdf).
// Use WOFF (or TTF) — see https://github.com/diegomura/react-pdf/issues/3042
import bebas from "@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff?url";
import dm400 from "@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff?url";
import dm500 from "@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff?url";
import instItalic from "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff?url";
import instNorm from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff?url";

let registered = false;

export function ensurePdfFonts(): void {
  if (registered) {
    return;
  }
  registered = true;
  Font.register({
    family: "DM Mono",
    fonts: [
      { src: dm400, fontWeight: 400 },
      { src: dm500, fontWeight: 500 },
    ],
  });
  Font.register({
    family: "Instrument Serif",
    fonts: [
      { src: instNorm, fontWeight: 400, fontStyle: "normal" },
      { src: instItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "Bebas Neue",
    src: bebas,
  });
}
