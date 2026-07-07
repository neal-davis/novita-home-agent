"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import styles from "./Code.module.scss";
import CopyToClipboard from "react-copy-to-clipboard";
import { message } from "@/components/ui/standard/notify";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { useState } from "react";

const getCode = (type: string) => {
  if (type == "Shell") {
    return `curl --location 'https://api.novita.ai/v3/async/txt2speech' \\
  --header 'Authorization: Bearer {{key}}' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "request": {
      "voice_id": "James",
      "language": "en-US",
      "texts": [
        "To be or not to be, that is a question."
      ],
      "volume": 1.2,
      "speed": 1.2
    }
  }'
    `;
  }
  if (type == "Python") {
    return `url = 'https://api.novita.ai/v3/async/txt2speech'
key = 'YOUR_API_KEY'

request_data = {
    'request': {
        'voice_id': 'James',
        'language': 'en-US',
        'texts': [
            'To be or not to be, that is a question.'
        ],
        'volume': 1.2,
        'speed': 1.2
    }
}

headers = {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
}

response = requests.post(url, headers=headers, data=json.dumps(request_data))
print(response.json())
    `;
  }
  return `const key = 'YOUR_API_KEY';

const requestData = {
  request: {
    voice_id: 'James',
    language: 'en-US',
    texts: [
      'To be or not to be, that is a question.'
    ],
    volume: 1.2,
    speed: 1.2
  }
};

fetch('https://api.novita.ai/v3/async/txt2speech', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${key}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  console.log(data);
})
.catch(error => {
  console.error('Error:', error);
});
  `;
};

export default function Code() {
  const languageList = ["Javascript", "Python", "Shell"];
  const [language, setLanguage] = useState("Javascript");
  const [code, setCode] = useState(getCode("Javascript"));

  const calcLanguage = (language: string) => {
    switch (language) {
      case "Javascript":
        return "javascript";
      case "Shell":
        return "bash";
      case "Python":
        return "python";
      default:
        return "javascript";
    }
  };
  return (
    <div className={styles.code}>
      <Tabs
        onValueChange={(lang) => {
          setLanguage(lang);
          setCode(getCode(lang));
        }}
        value={language}
      >
        <TabsList className={styles.header}>
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
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
        <div
          className={`${styles.code_wrapper} h-[570px] w-full mt-[10px] flex flex-col items-stretch bg-[var(--dark-1)] overflow-hidden`}
        >
          <div className="flex items-center justify-between h-[40px] basis-[40px] shrink-0 grow-0 px-[12px] border-solid border-b border-[var(--dark-2)]">
            <div className={`flex items-center gap-[6px]`}>
              <span
                className={`w-[8px] h-[8px] rounded-full bg-[var(--red-3)]`}
              ></span>
              <span
                className={`w-[8px] h-[8px] rounded-full bg-[var(--yellow-5)]`}
              ></span>
              <span
                className={`w-[8px] h-[8px] rounded-full bg-[var(--gray-1)]`}
              ></span>
            </div>
            <CopyToClipboard
              text={code}
              onCopy={() => {
                message.success("Copied to clipboard");
              }}
            >
              <div className="w-[65px] h-[24px] rounded-full font-subtle bg-[var(--dark-2)] text-center text-[var(--gray-1)] cursor-pointer">
                Copy
              </div>
            </CopyToClipboard>
          </div>
          <TabsContent value={language} className="flex-1 overflow-hidden">
            <SyntaxHighlighter
              style={vscDarkPlus}
              showLineNumbers
              wrapLines={true}
              wrapLongLines={true}
              language={calcLanguage(language)}
              codeTagProps={{
                className: "!tt-mono",
              }}
              customStyle={{
                background: "var(--dark-1)",
                padding: "10px",
                marginTop: 0,
                height: "100%",
              }}
            >
              {code}
            </SyntaxHighlighter>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
