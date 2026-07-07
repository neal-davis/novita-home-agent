export enum CODE_LANG {
  JAVASCRIPT = "javascript",
  PYTHON = "python",
  GOLANG = "go",
  BASH = "bash",
}

function sliceImgBase64(key: string, val: any): string {
  if (
    typeof val === "string" &&
    val.length > 500 &&
    (key.endsWith("_file") || /data:image\/\w+;base64/.test(val))
  ) {
    return `${val.slice(0, 500)}...`;
  }
  return `${val}`;
}

function escapeNewLines(ori: string) {
  if (!ori) {
    return ori;
  }
  return ori.replace(/\r\n|\r|\n/g, "\\n");
}

export function genSampleCode(
  template: string,
  lang: CODE_LANG,
  params: { [key: string]: any },
): string {
  const code = template.replace(/{{([\w.]+)}}/g, (match, p1) => {
    if (Array.isArray(params[p1]) && typeof params[p1][0] === "string") {
      const arrVal = params[p1]
        .map((val: string) => `"${sliceImgBase64(p1, val)}"`)
        .join(", ");
      const pyArrVal = params[p1]
        .map((val: string) => `'${sliceImgBase64(p1, val)}'`)
        .join(", ");
      if (lang === CODE_LANG.GOLANG) {
        return `[]string{${arrVal}}`;
      }
      if (lang === CODE_LANG.PYTHON) {
        return `[${pyArrVal}]`;
      }
      return `[${arrVal}]`;
    }
    if (p1 === "prompt") {
      if (
        params.lora &&
        Array.isArray(params.lora) &&
        lang !== CODE_LANG.JAVASCRIPT
      ) {
        const loraStr = params.lora.map(
          (lora: any) => `<${lora.model_name}:${lora.strength}>`,
        );
        let prompt = escapeNewLines(params[p1]);
        loraStr.forEach((str) => {
          if (!prompt.includes(str)) {
            prompt = prompt + `, ${str}`;
          }
        });
        return prompt;
      }
      return escapeNewLines(params[p1]);
    }
    if (p1 === "txt2video_prompts") {
      if (Array.isArray(params.txt2video_prompts)) {
        const promptsStr = params.txt2video_prompts
          .map((p) => `{ prompt: "${p.prompt}", frames: ${p.frames} }`)
          .join(", ");
        return `[${promptsStr}]`;
      }
    }
    if (p1 === "loras") {
      if (Array.isArray(params[p1])) {
        const arr = params[p1]
          .filter((l: any) => !!l.modelName)
          .map((l: any) => ({
            model_name: l.modelName,
            strength: l.strength,
          }));
        return JSON.stringify(arr);
      }
      return "[]";
    }
    if (p1 === "embeddings") {
      if (Array.isArray(params[p1])) {
        const arr = params[p1]
          .filter((l: any) => !!l.modelName)
          .map((l: any) => ({
            model_name: l.modelName,
          }));
        return JSON.stringify(arr);
      }
      return "[]";
    }
    if (p1 === "sd_refiner.switch_at") {
      return params.sd_refiner?.switchAt;
    }
    if (p1 === "controlnet") {
      if (Array.isArray(params[p1]?.units)) {
        const arr = params[p1].units.map((l: any) => ({
          model_name: l.modelName,
          image_base64: sliceImgBase64("image_base64", l.imageBase64),
          strength: l.strength,
          preprocessor: l.preprocessor,
          guidance_start: l.guidanceStart,
          guidance_end: l.guidanceEnd,
        }));
        return JSON.stringify(arr);
      }
      return "{}";
    }
    if (p1 === "ip_adapters") {
      if (Array.isArray(params[p1])) {
        const arr = params[p1].map((l: any) => ({
          model_name: l.modelName,
          image_base64: sliceImgBase64("image_base64", l.imageBase64),
          strength: l.strength,
        }));
        return JSON.stringify(arr);
      }
      return "[]";
    }

    let content: string = "";
    if (params[p1] !== undefined) {
      if (typeof params[p1] === "string") {
        content = sliceImgBase64(p1, escapeNewLines(params[p1])).replace(
          /\n/g,
          "\\n",
        );
      } else {
        content = params[p1];
      }
    }
    return content;
  });
  return code;
}

export function findCodeLine(code: string, key: string): number {
  if (!code) {
    return 0;
  }
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`{{${key}}}`)) {
      return i + 1;
    }
  }
  return 0;
}
