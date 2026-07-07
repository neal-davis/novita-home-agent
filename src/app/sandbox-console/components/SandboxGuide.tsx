"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Check, CheckCircle2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeBlock {
  language: string;
  prismLanguage: string;
  code: string;
}

interface StepProps {
  number: number;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const CodeBlockTabs: React.FC<{
  blocks: CodeBlock[];
  showLineNumbers?: boolean;
  activeTab?: number;
  setActiveTab?: (idx: number) => void;
}> = ({
  blocks,
  showLineNumbers = true,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeTab =
    externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab || setInternalActiveTab;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blocks[activeTab].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (non-secure context); silently no-op
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <div className="bg-[var(--fill-4)] flex gap-1 items-center p-1 rounded-[20px]">
          {blocks.map((block, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`h-6 px-2 rounded-[12px] text-[12px] font-medium transition-colors ${
                activeTab === idx
                  ? "bg-[var(--white)] text-[var(--text-2)]"
                  : "text-[var(--text-2)] hover:bg-[var(--fill-3)]"
              }`}
            >
              {block.language}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="bg-[var(--fill-4)] p-1 hover:bg-[var(--fill-3)] rounded-[6px] transition-colors flex items-center justify-center w-8 h-8"
          title="Copy code"
        >
          {copied ? (
            <Check size={12} className="text-[var(--brand-1)]" />
          ) : (
            <Copy size={12} className="text-[var(--text-2)]" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={blocks[activeTab].prismLanguage}
        style={oneLight}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: "12px",
          background: "var(--fill-5)",
          borderRadius: "8px",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
            fontSize: "12px",
          },
        }}
        lineNumberStyle={{
          minWidth: "2em",
          paddingRight: "1em",
          color: "var(--text-3)",
          userSelect: "none",
        }}
      >
        {blocks[activeTab].code}
      </SyntaxHighlighter>
    </div>
  );
};

const Step: React.FC<StepProps> = ({
  number,
  title,
  description,
  actions,
  children,
}) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex gap-2 items-center w-full">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--fill-3)] flex-shrink-0">
        <span className="text-[12px] font-medium text-[var(--text-1)]">
          {number}
        </span>
      </div>
      <h3 className="text-[14px] font-medium text-[var(--text-1)]">{title}</h3>
      {actions && <div className="ml-auto flex items-center">{actions}</div>}
    </div>
    {description && (
      <p className="text-[12px] text-[var(--text-3)] pl-8">{description}</p>
    )}
    {children && <div className="pl-8 w-full">{children}</div>}
  </div>
);

export default function SandboxGuide() {
  const router = useRouter();
  const [globalActiveTab, setGlobalActiveTab] = useState(0);

  const installBlocks: CodeBlock[] = [
    {
      language: "Python",
      prismLanguage: "bash",
      code: "pip install novita-sandbox",
    },
    {
      language: "JavaScript & TypeScript SDK",
      prismLanguage: "bash",
      code: "npm install novita-sandbox",
    },
  ];

  const usageBlocks: CodeBlock[] = [
    {
      language: "Python",
      prismLanguage: "python",
      code: `# main.py
from novita_sandbox.code_interpreter import Sandbox

# create sandbox
sandbox = Sandbox.create()
execution = sandbox.run_code("print('hello world')")
print(execution.logs)

# Close sandbox when no longer needed
sandbox.kill()`,
    },
    {
      language: "JavaScript & TypeScript",
      prismLanguage: "typescript",
      code: `// index.ts
import { Sandbox } from 'novita-sandbox/code-interpreter'
async function main() {
  const sandbox = await Sandbox.create()
  try {
    const execution = await sandbox.runCode('print("hello world")')
    console.log(execution.logs)
  } finally {
    // Close sandbox when no longer needed
    await sandbox.kill()
  }
}
main().catch((err) => {
  console.error(err)
  process.exit(1)
})`,
    },
  ];

  const executeBlocks: CodeBlock[] = [
    {
      language: "main.py",
      prismLanguage: "bash",
      code: `export NOVITA_API_KEY=sk_***
python3 main.py`,
    },
    {
      language: "index.ts",
      prismLanguage: "bash",
      code: `export NOVITA_API_KEY=sk_***
npx tsx ./index.ts`,
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[var(--brand-3)] to-[var(--white)] border border-[var(--brand-2)] rounded-[16px] p-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-[24px] font-medium text-[var(--text-1)] tracking-[-0.48px]">
            Build Stateful Agents with Novita Sandbox
          </h1>

          <ul className="flex flex-col gap-2">
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-1)] flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-[var(--text-2)]">
                Run AI-generated code, tools, and browsers in secure cloud
                sandboxes
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-1)] flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-[var(--text-2)]">
                Scale from one sandbox to thousands for coding, data analysis,
                and RL workloads
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-1)] flex-shrink-0 mt-0.5" />
              <span className="text-[14px] text-[var(--text-2)]">
                Zero infrastructure management
              </span>
            </li>
          </ul>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() =>
                window.open(
                  "https://novita.ai/docs/guides/sandbox-overview",
                  "_blank",
                )
              }
              className="h-9 px-5 bg-[var(--element-high-em)] text-[var(--element-inverse)] hover:bg-[var(--element-high-em)] rounded-full text-[15px] font-medium"
            >
              Docs
            </Button>
            <Button
              onClick={() =>
                window.open(
                  "https://novita.ai/docs/guides/sandbox-cli",
                  "_blank",
                )
              }
              variant="outline"
              className="h-9 px-5 border border-[var(--border-strong)] text-[var(--text-1)] hover:bg-[var(--fill-3)] rounded-full text-[15px] font-medium"
            >
              CLI Reference
            </Button>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="bg-[var(--white)] border border-[var(--border-3)] rounded-[16px] p-6 flex flex-col gap-4">
        {/* Step 1 */}
        <Step
          number={1}
          title="Create API KEY"
          actions={
            <div className="flex gap-2 items-center flex-wrap">
              <Button
                variant="outline"
                className="h-8 px-3 text-[12px] border border-[var(--text-1)] text-[var(--text-1)] hover:bg-[var(--fill-3)] rounded-full"
                onClick={() => router.push("/settings/key-management")}
              >
                Go to Key Management
              </Button>
              <Button
                className="h-8 px-3 text-[12px] bg-[var(--text-1)] text-[var(--white)] hover:bg-[var(--text-2)] rounded-full"
                onClick={() =>
                  router.push("/settings/key-management?action=add")
                }
              >
                Add API Key
              </Button>
            </div>
          }
        />

        {/* Step 2 */}
        <Step
          number={2}
          title="Install SDK"
          description="You can install the SDK by executing the following commands."
        >
          <CodeBlockTabs
            blocks={installBlocks}
            showLineNumbers={false}
            activeTab={globalActiveTab}
            setActiveTab={setGlobalActiveTab}
          />
        </Step>

        {/* Step 3 */}
        <Step
          number={3}
          title="Use SDK to Start Agent Sandbox"
          description="Below is a simple example showing how to create a sandbox through the SDK and run specified commands."
        >
          <div className="flex flex-col gap-4">
            <CodeBlockTabs
              blocks={usageBlocks}
              activeTab={globalActiveTab}
              setActiveTab={setGlobalActiveTab}
            />

            <div className="flex flex-col gap-2">
              <p className="text-[12px] text-[var(--text-3)]">
                Execute the following commands to run the above code.
              </p>
              <CodeBlockTabs
                blocks={executeBlocks}
                activeTab={globalActiveTab}
                setActiveTab={setGlobalActiveTab}
              />
            </div>
          </div>
        </Step>
      </div>
    </div>
  );
}
