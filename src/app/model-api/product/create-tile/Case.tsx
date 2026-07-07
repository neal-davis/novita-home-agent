"use client";

import Tile from "@/app/components/demos/Tile/Tile";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try create tile API demo</h2>
      <div className={`font-p text-center`}>
        Generates images with{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2> that
        can be used as repeating tiles to create seamless patterns for fabrics,
        wallpapers, and textures. Use a pattern-making tool like{" "}
        <a
          style={{ textDecoration: "underline" }}
          href="https://www.pycheung.com/checker/"
          target="_blank"
        >
          this
        </a>{" "}
        to see the repeated tiles. Visit the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.TILE.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.TILE}
        renderCase={(props) => {
          return <Tile {...props} />;
        }}
      />
    </div>
  );
}
