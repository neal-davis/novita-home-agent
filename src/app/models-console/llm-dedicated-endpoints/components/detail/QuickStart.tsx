"use client";

import { useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";

interface QuickStartProps {
  endpointUrl: string;
  modelId: string;
}

const LANGUAGE_TABS = [
  { id: "python", label: "Python" },
  { id: "typescript", label: "Typescript" },
  { id: "shell", label: "Shell" },
];

export default function QuickStart({ endpointUrl, modelId }: QuickStartProps) {
  const [codeTab, setCodeTab] = useState<string>("python");

  const codeExamples = useMemo(() => {
    return {
      python: `from openai import OpenAI

client = OpenAI(
    api_key="<Your API Key>",
    base_url="${endpointUrl}"
)

response = client.chat.completions.create(
    model="${modelId}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
    ],
    max_tokens=1000,
    temperature=0.7
)

print(response.choices[0].message.content)`,
      typescript: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '<Your API Key>',
  baseURL: '${endpointUrl}'
});

const response = await openai.chat.completions.create({
  model: '${modelId}',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ],
  max_tokens: 1000,
  temperature: 0.7
});

console.log(response.choices[0].message.content);`,
      shell: `curl -X POST "${endpointUrl}/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <Your API Key>" \\
  -d '{
    "model": "${modelId}",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "max_tokens": 1000,
    "temperature": 0.7
  }'`,
    };
  }, [endpointUrl, modelId]);

  const getLanguage = (language: string) => {
    switch (language) {
      case "python":
        return "python";
      case "typescript":
        return "typescript";
      case "shell":
        return "bash";
      default:
        return "text";
    }
  };

  return (
    <div>
      {/* Quick Start Title */}
      <h4 className="text-[14px] font-semibold text-[var(--dark-1)] mb-3 pl-4">
        Quick Start
      </h4>

      {/* Endpoint URL + API Key */}
      <div className="p-4 rounded-[6px] border border-[var(--gray-2)] space-y-3">
        {/* Endpoint URL */}
        <div>
          <p className="font-small text-[var(--dark-3)] mb-1.5">Endpoint URL</p>
          <div className="flex items-center justify-between px-3 py-2 rounded-[4px] bg-[var(--gray-3)] border border-[var(--gray-2)]">
            <span className="font-small font-mono text-[var(--dark-1)] truncate">
              {endpointUrl}
            </span>
            <CopyBtn
              content={endpointUrl}
              size={14}
              className="shrink-0 ml-2 text-[var(--dark-3)] hover:text-[var(--dark-1)] hover:!scale-100"
            />
          </div>
        </div>

        {/* API Key */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[var(--dark-1)]">
            API Key
          </span>
          <Link href={NOVITA_URL.SETTINGS_KEYS} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[12px]"
            >
              Manage API Keys
            </Button>
          </Link>
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-3 rounded-[6px] border border-[var(--gray-2)] overflow-hidden">
        {/* Header with language tabs and copy button */}
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--gray-3)]">
          <Tabs value={codeTab} onValueChange={setCodeTab}>
            <TabsList className="h-8 bg-transparent">
              {LANGUAGE_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-6 px-3 text-[12px] bg-transparent data-[state=active]:bg-white"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <CopyBtn
            content={codeExamples[codeTab as keyof typeof codeExamples]}
            size={16}
            className="text-[var(--dark-2)] hover:text-[var(--dark-1)]"
          />
        </div>

        {/* Code block with syntax highlighting - max 20 lines with scroll */}
        <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
          <SyntaxHighlighter
            style={vs}
            language={getLanguage(codeTab)}
            customStyle={{
              margin: 0,
              padding: "16px",
              backgroundColor: "white",
              fontSize: "12px",
              border: "none",
              borderRadius: 0,
            }}
            showLineNumbers
          >
            {codeExamples[codeTab as keyof typeof codeExamples]}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
