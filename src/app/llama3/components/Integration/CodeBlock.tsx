"use client";
import { useCallback, useRef, useState, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import CopyToClipboard from "react-copy-to-clipboard";
import hljs from "highlight.js/lib/core";
import hlPython from "highlight.js/lib/languages/python";
import hlBash from "highlight.js/lib/languages/bash";
import hlJavascript from "highlight.js/lib/languages/javascript";
import "./codeTheme.scss";
import { TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
export interface CodeBlockProps {
  language: string;
  isActive?: boolean;
}
hljs.registerLanguage("python", hlPython);
hljs.registerLanguage("bash", hlBash);
hljs.registerLanguage("javascript", hlJavascript);
const model = "meta-llama/llama-3.1-8b-instruct";
const prompt =
  "A chat between a curious user and an artificial intelligence assistant";
const baseURL = "https://api.novita.ai/openai";
const docUrl =
  "https://novita.ai/docs/get-started/quickstart.html#_2-manage-api-key";
const API_KEY_COMMENT = `Get the Novita AI API Key by referring: ${docUrl}`;
const API_KEY_PLACEHOLDER = "<YOUR Novita AI API Key>";
export const pythonCode = `from openai import OpenAI

client = OpenAI(
  base_url='${baseURL}',
  api_key='${API_KEY_PLACEHOLDER}',
  # ${API_KEY_COMMENT}
)

completion_res = client.completions.create(
  model='${model}',
  prompt='${prompt}',
  stream=True,
  max_tokens=512,
)
`;
export const curlCode = `export API_KEY="${API_KEY_PLACEHOLDER}"
# ${API_KEY_COMMENT}

curl "${baseURL}/completions" \\
  -H "Content-Type" : "application/json" \\
  -H "Authorization" : Bearer "$API_KEY" \\
  -d '{
    "model" : "${model}",
    "prompt" : "${prompt}",
    "max_tokens" : 512
  }'
`;
export const jsCode = `import OpenAI from 'openai';
// ${API_KEY_COMMENT}

const client = new OpenAI({
  baseURL: '${baseURL}',
  apiKey: '${API_KEY_PLACEHOLDER}',
});

const completion = await client.completions.create({
  model: '${model}',
  prompt: '${prompt}',
  stream: true,
  max_tokens: 512,
});
`;
function getCode(language: string) {
  if (language === "Python") return pythonCode;
  if (language === "Curl") return curlCode;
  if (language === "Node.js") return jsCode;
  return pythonCode;
}
function getHljsLang(language: string) {
  if (language === "Python") return "python";
  if (language === "Curl") return "bash";
  if (language === "Node.js") return "javascript";
  return "python";
}
const languageList = ["Python", "Node.js", "Curl"];
const logoMap = {
  Python: "/llama3/python.svg",
  Curl: "/llama3/curl.svg",
  "Node.js": "/llama3/nodejs.svg",
};
export default function CodeBlock() {
  const [highlightedCode, setHighlightedCode] = useState(pythonCode);
  const [language, setLanguage] = useState("Python");
  const ref = useRef<HTMLDivElement>(null);
  const writeCodes = useCallback(() => {
    const container = ref.current;
    if (!container) return;
    setHighlightedCode(
      hljs.highlight(getCode(language), {
        language: getHljsLang(language),
      }).value,
    );
  }, [language]);
  useEffect(() => {
    writeCodes();
  }, [language, writeCodes]);
  return (
    <div>
      <Tabs
        onValueChange={(lang) => {
          setLanguage(lang);
        }}
        value={language}
      >
        <TabsList className="bg-transparent border-b-common-gray-1">
          {languageList.map((item) => (
            <TabsTrigger
              key={item}
              value={item}
              className={`font-h6 text-[var(--dark-3)]
                py-[16px] px-[30px]
                border-b-[5px] border-transparent data-[state=active]:border-[var(--black)]
                rounded-none bg-transparent data-[state=active]:bg-transparent
                !shadow-none
              `}
            >
              <div className="flex items-center gap-2">
                <img
                  src={logoMap[item as keyof typeof logoMap]}
                  alt={item}
                  height={20}
                />
                <span>{item}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="overflow-hidden mt-5">
        <header className="flex flex-wrap gap-5 justify-between py-1.5 pr-6 pl-3 w-full border-b border-solid bg-common-dark-1 max-md:pr-5 max-md:max-w-full border-common-dark-2">
          <div className="flex gap-1.5 items-start my-auto">
            <div className="flex shrink-0 w-2 h-2 bg-red-400 rounded-md border-red-600 border-solid border-[0.343px]" />
            <div className="flex shrink-0 w-2 h-2 bg-amber-200 rounded-lg border-amber-300 border-solid border-[0.5px]" />
            <div className="flex shrink-0 w-2 h-2 rounded-lg border-solid bg-slate-200 border-[0.5px] border-slate-300" />
          </div>
          <CopyToClipboard
            text={highlightedCode}
            onCopy={() => {
              highlightedCode
                ? message.success("Copied successfully")
                : message.error("Copy failed");
            }}
          >
            <button
              className="flex flex-col justify-center px-4 text-sm font-medium leading-none text-center whitespace-nowrap bg-common-dark-2 rounded-md  min-h-[30px] text-common-gray-1"
              aria-label="Copy code"
            >
              {"Copy"}
            </button>
          </CopyToClipboard>
        </header>
        <div className="py-2 h-[450px] scrollBar_container bg-common-dark-1 overflow-x-auto flex-1">
          <SyntaxHighlighter
            language={getHljsLang(language)}
            style={vscDarkPlus}
            customStyle={{
              backgroundColor: "transparent",
            }}
          >
            {highlightedCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
