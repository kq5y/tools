import satori, { type Font, init } from "satori/wasm";
import { initialize, svg2png } from "svg2png-wasm";
import wasm from "svg2png-wasm/svg2png_wasm_bg.wasm";
import initYoga from "yoga-wasm-web";
import yogaWasm from "yoga-wasm-web/dist/yoga.wasm";

import { SITE_TITLE, SITE_URL } from "~/const";

const WIDTH = 1200;
const HEIGHT = 630;

const genModuleInit = () => {
  let isInit = false;
  return async () => {
    if (isInit) {
      return;
    }
    init(await initYoga(yogaWasm));
    await initialize(wasm);
    isInit = true;
  };
};
const moduleInit = genModuleInit();

async function getFonts(name: string, fonts: [string, Font["weight"]][]) {
  return await Promise.all(
    fonts.map(async ([filename, weight]) => {
      const data = await fetch(`${SITE_URL}/fonts/${filename}.woff`);
      return {
        name,
        data: await data.arrayBuffer(),
        weight: weight,
      } as Font;
    })
  );
}

export async function generateOgImage(
  cat: string,
  slug: string,
  title: string
) {
  await moduleInit();

  const fonts: Font[] = await getFonts("inconsolata", [
    ["Inconsolata-Bold", 700],
    ["Inconsolata-Regular", 400],
  ]);

  const svg = await satori(
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(0deg, #0f0c38, #030221)",
        color: "#eee",
        fontFamily: "inconsolata, sans-serif",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50px",
          left: "50px",
          right: "50px",
          bottom: "50px",
          borderRadius: "50px",
          background: "#5a596b45",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "80px",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            color: "#bbb",
            zIndex: "1",
          }}
        >{`/*** ${SITE_TITLE} ***/`}</div>
        <div
          style={{ fontSize: "90px", fontWeight: "bold", zIndex: "1" }}
        >{`${cat}.${slug}`}</div>
        <div
          style={{
            fontSize: "60px",
            fontWeight: "bold",
            color: "#ddd",
            zIndex: "1",
          }}
        >
          {title}
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: fonts,
    }
  );

  return await svg2png(svg);
}
