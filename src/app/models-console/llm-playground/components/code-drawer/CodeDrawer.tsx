"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/cjs/styles/prism";
import styles from "./code.module.scss";
import {
  curlChatCompletions,
  jsChatCompletions,
  pythonChatCompletions,
  curlCompletions,
  jsCompletions,
  pythonCompletions,
  curlResponse,
  jsResponse,
  pythonResponse,
} from "./code";
import { LLMModelWithStatus } from "@/types/models";
import { ChatMode } from "../../types/types";
import { Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyToClipboard from "react-copy-to-clipboard";
import { message } from "@/components/ui/standard/notify";

export const LLMCode = [
  {
    type: "bash",
    tab: "HTTP",
  },
  {
    type: "python",
    tab: "Python",
  },
  {
    type: "javascript",
    tab: "JavaScript",
  },
];

const toSingleLine = (inputText: string) => {
  try {
    return inputText ? JSON.stringify(inputText) : '""';
  } catch (e) {
    return '""';
  }
};

export function CodeDrawer({
  open,
  onOpenChange,
  model,
  chatParams,
  chatMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: LLMModelWithStatus | null;
  chatParams: Record<string, any>;
  chatMode: ChatMode;
}) {
  const [tab, setTab] = useState<string>(LLMCode[0].tab);

  const system_content = toSingleLine(chatParams.system_content);

  const code = useMemo(() => {
    if (!model) return "";

    const params = {
      ...chatParams,
      model: model.id,
      system_content,
    };

    const apiKey = "<YOUR NOVITA API Key>";

    // Chat mode - use chat completions
    if (chatMode === ChatMode.Chat) {
      if (tab === "Python") {
        return pythonChatCompletions(params, apiKey);
      }
      if (tab === "HTTP") {
        return curlChatCompletions(params, apiKey);
      }
      if (tab === "JavaScript") {
        return jsChatCompletions(params, apiKey);
      }
    }

    // Completion mode - use completions
    if (chatMode === ChatMode.Completion) {
      if (tab === "Python") {
        return pythonCompletions(params, apiKey);
      }
      if (tab === "HTTP") {
        return curlCompletions(params, apiKey);
      }
      if (tab === "JavaScript") {
        return jsCompletions(params, apiKey);
      }
    }

    // Response mode - use response API
    if (chatMode === ChatMode.Response) {
      if (tab === "Python") {
        return pythonResponse(params, apiKey);
      }
      if (tab === "HTTP") {
        return curlResponse(params, apiKey);
      }
      if (tab === "JavaScript") {
        return jsResponse(params, apiKey);
      }
    }

    return "";
  }, [tab, model, chatParams, system_content, chatMode]);

  const getLanguage = () => {
    if (tab === "HTTP") return "bash";
    if (tab === "Python") return "python";
    if (tab === "JavaScript") return "javascript";
    return "python";
  };

  const getTitle = () => {
    if (chatMode === ChatMode.Chat) {
      return "Chat Completions API";
    }
    if (chatMode === ChatMode.Response) {
      return "Response API";
    }
    return "Completions API";
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 left-auto h-screen w-[700px] max-w-[700px] rounded-none border-l mt-0 after:hidden">
        <DrawerHeader className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <DrawerTitle className="text-left">{getTitle()}</DrawerTitle>
            <DrawerDescription className="text-left mt-2"></DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 border-none"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 flex flex-col px-6 pb-6">
          <div
            className={`${styles.code} flex-1 flex flex-col overflow-hidden border border-common-gray-2 rounded-md`}
          >
            <div className="flex-1 flex flex-col relative">
              <div className="bg-common-gray-3 shrink-0 flex justify-start p-2 rounded-t-md">
                {LLMCode.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setTab(item.tab)}
                    className={`px-2 py-1 text-sm font-medium transition-colors rounded-sm ${
                      tab === item.tab
                        ? "bg-white text-black shadow-sm"
                        : "text-common-dark-2 hover:text-common-dark-1"
                    }`}
                  >
                    {item.tab}
                  </button>
                ))}
              </div>
              <div className={styles.copy}>
                <CopyToClipboard
                  text={code}
                  onCopy={() => {
                    message.success("Copied to clipboard");
                  }}
                >
                  <Button variant="outline" size="sm">
                    <div className="flex items-center gap-1">
                      <Copy className="w-4 h-4" />
                      Copy
                    </div>
                  </Button>
                </CopyToClipboard>
              </div>
              <div className={`flex-1 ${styles.codeContent}`}>
                <SyntaxHighlighter
                  style={vs}
                  showLineNumbers
                  wrapLines={true}
                  language={getLanguage()}
                  customStyle={{
                    margin: 0,
                    maxHeight: "none",
                    height: "auto",
                  }}
                  codeTagProps={{
                    className: "!tt-mono",
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
