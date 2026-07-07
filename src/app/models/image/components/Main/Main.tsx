"use client";

import styles from "./Main.module.css";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Func } from "../../../lib/funcs";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { KeyContext } from "../../../lib/context";
import PlaygroundWrapper from "../PlaygroundWrapper";
import CodeEditor from "../CodeEditor/CodeEditor";
import Disabled from "../Disabled/Disabled";
import Nav from "../Nav/Nav";
import Txt2Img from "@/app/components/demos/Txt2Img";
import Img2Img from "@/app/components/demos/Img2Img";
import SDXL from "@/app/components/demos/SDXL";
import Outpainting from "@/app/components/demos/Outpainting/Outpainting";
import RemoveBackground from "@/app/components/demos/RemoveBackground/RemoveBackground";
import Cleanup from "@/app/components/demos/Cleanup/Cleanup";
import ReplaceBackground from "@/app/components/demos/ReplaceBackground/ReplaceBackground";
import MixPose from "@/app/components/demos/MixPose/MixPose";
import Doodle from "@/app/components/demos/Doodle/Doodle";
import LCMTxt2Img from "@/app/components/demos/LCM/LCMTxt2Img";
import ReplaceSky from "@/app/components/demos/ReplaceSky/ReplaceSky";
import ReplaceObject from "@/app/components/demos/ReplaceObject/ReplaceObject";
import MergeFace from "@/app/components/demos/MergeFace/MergeFace";
import RemoveText from "@/app/components/demos/RemoveText/RemoveText";
import RestoreFace from "@/app/components/demos/RestoreFace/RestoreFace";
import Reimagine from "@/app/components/demos/Reimagine/Reimagine";
import Upscale from "@/app/components/demos/Upscale/Upscale";
import Tile from "@/app/components/demos/Tile/Tile";
import Inpainting from "@/app/components/demos/Inpainting/Inpainting";
import Img2Video from "@/app/components/demos/Img2Video/Img2Video";
import RemoveWatermark from "@/app/components/demos/RemoveWatermark/RemoveWatermark";
import MotionSync from "@/app/components/demos/MotionSync/MotionSync";
import Txt2Video from "@/app/components/demos/Txt2Video/Txt2Video";
import HunyuanVideoFast from "@/app/components/demos/Hunyuan-video-fast/index";
import WanT2V from "@/app/components/demos/Wan-t2v/index";
import WanI2V from "@/app/components/demos/Wan-i2v/index";
import Wan26T2v from "@/app/components/demos/Wan26-t2v/index";
import Wan26I2v from "@/app/components/demos/Wan26-i2v/index";
import Wan26V2v from "@/app/components/demos/Wan26-v2v/index";
import KlingV16T2V from "@/app/components/demos/KlingV16T2v/index";
import KlingV16I2V from "@/app/components/demos/KlingV16I2v/index";
import MinimaxVideo01 from "@/app/components/demos/MinimaxVideo01/index";
import MinimaxHailuo02 from "@/app/components/demos/MinimaxHailuo02/index";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";

export default function Playground() {
  const { func, setFunc, allFuncs } = useContext(KeyContext);
  const [curApiKey, setCurApiKey] = useState("");
  const [curFunc, setCurFunc] = useState<Func | undefined>();

  const router = useRouter();

  const keys = useSelectKeys();

  useEffect(() => {
    console.log("api keys changed", keys);
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      setCurApiKey("");
      return;
    }
    if (
      (keys as string[]).length > 0 &&
      (keys as string[]).indexOf(curApiKey) === -1
    ) {
      setCurApiKey(keys[0]);
    }
  }, [keys, curApiKey]);

  useEffect(() => {
    const curf = allFuncs.find((f: Func) => f.info.name === func);
    if (curf) {
      if (!curf.info.playgroundReady) {
        const redirectUrl = `/models/end-of-service`;
        router.replace(redirectUrl);
        return;
      }
      setFunc(curf.info.name);
      setCurFunc(curf);
    }
  }, [func, allFuncs, setFunc, router]);

  return (
    <div className={styles.playground}>
      <Nav selected={curFunc?.info.name}></Nav>
      <div className={`${styles.body}`}>
        <div className={`${styles.body_content}`}>
          {!curFunc?.info.playgroundReady
            ? curFunc && <Disabled func={curFunc?.info} />
            : curFunc && (
                <PlaygroundWrapper
                  curFunc={curFunc}
                  renderCase={(props) => {
                    switch (func) {
                      case FUNC_NAME.TXT2IMG:
                        return <Txt2Img {...props} />;
                      case FUNC_NAME.IMG2IMG:
                        return <Img2Img {...props} />;
                      case FUNC_NAME.SDXL:
                        return <SDXL {...props} />;
                      case FUNC_NAME.LCM_TXT2IMG:
                        return <LCMTxt2Img {...props} />;
                      case FUNC_NAME.OUTPAINTING:
                        return <Outpainting {...props} />;
                      case FUNC_NAME.REMOVE_BACKGROUND:
                        return <RemoveBackground {...props} />;
                      case FUNC_NAME.CLEANUP:
                        return <Cleanup {...props} />;
                      case FUNC_NAME.REPLACE_BACKGROUND:
                        return <ReplaceBackground {...props} />;
                      case FUNC_NAME.MIX_POSE:
                        return <MixPose {...props} />;
                      case FUNC_NAME.DOODLE:
                        return <Doodle {...props} />;
                      case FUNC_NAME.REPLACE_SKY:
                        return <ReplaceSky {...props} />;
                      case FUNC_NAME.REPLACE_OBJECT:
                        return <ReplaceObject {...props} />;
                      case FUNC_NAME.MERGE_FACE:
                        return <MergeFace {...props} />;
                      case FUNC_NAME.REMOVE_TEXT:
                        return <RemoveText {...props} />;
                      case FUNC_NAME.RESTORE_FACE:
                        return <RestoreFace {...props} />;
                      case FUNC_NAME.REIMAGINE:
                        return <Reimagine {...props} />;
                      case FUNC_NAME.UPSCALE:
                        return <Upscale {...props} />;
                      case FUNC_NAME.TILE:
                        return <Tile {...props} />;
                      case FUNC_NAME.INPAINTING:
                        return <Inpainting {...props} />;
                      case FUNC_NAME.WAN_T2V:
                        return <WanT2V {...props} />;
                      case FUNC_NAME.WAN_I2V:
                        return <WanI2V {...props} />;
                      case FUNC_NAME.WAN_2_6_T2V:
                        return <Wan26T2v {...props} />;
                      case FUNC_NAME.WAN_2_6_I2V:
                        return <Wan26I2v {...props} />;
                      case FUNC_NAME.WAN_2_6_V2V:
                        return <Wan26V2v {...props} />;
                      case FUNC_NAME.HUNYUAN_VIDEO_FAST:
                        return <HunyuanVideoFast {...props} />;
                      case FUNC_NAME.KLING_V1_6_T2V:
                        return <KlingV16T2V {...props} />;
                      case FUNC_NAME.KLING_V1_6_I2V:
                        return <KlingV16I2V {...props} />;
                      case FUNC_NAME.MINIMAX_VIDEO_01:
                        return <MinimaxVideo01 {...props} />;
                      case FUNC_NAME.MINIMAX_HAILUO_02:
                        return <MinimaxHailuo02 {...props} />;
                      case FUNC_NAME.TXT2VIDEO:
                        return <Txt2Video {...props} />;
                      case FUNC_NAME.IMG2VIDEO:
                        return <Img2Video {...props} />;
                      case FUNC_NAME.REMOVE_WATERMARK:
                        return <RemoveWatermark {...props} />;
                      case FUNC_NAME.MOTIONSYNC:
                        return (
                          <MotionSync
                            key={FUNC_NAME.MOTIONSYNC}
                            {...props}
                            funcName={FUNC_NAME.MOTIONSYNC}
                          />
                        );
                      case FUNC_NAME.ANIMATE_ANYONE:
                        return (
                          <MotionSync
                            key={FUNC_NAME.ANIMATE_ANYONE}
                            {...props}
                            funcName={FUNC_NAME.ANIMATE_ANYONE}
                          />
                        );
                      default:
                        return <></>;
                    }
                  }}
                />
              )}
        </div>
        <CodeEditor />
      </div>
    </div>
  );
}
