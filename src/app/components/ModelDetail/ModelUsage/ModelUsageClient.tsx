"use client";

import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
import MDDocs from "@/components/ui/standard/md-docs";
import { LLMModelWithStatus } from "@/types/models";
import { CODE_EXAMPLES, LANGUAGE_TABS } from "./constants";

interface ModelUsageClientProps {
  className?: string;
  model?: LLMModelWithStatus;
  initialContent?: { [key: string]: string };
  modelConfig?: any;
}

interface ModelReadmeContent {
  [key: string]: string;
}

const ModelUsageClient: React.FC<ModelUsageClientProps> = ({
  className,
  model,
  initialContent = {},
  modelConfig,
}) => {
  const [activeTab, setActiveTab] = useState<string>("api-usage");
  const [codeTab, setCodeTab] = useState<string>("python");
  const [modeTab, setModeTab] = useState<string>("chat");
  const [modelReadmeContent] = useState<ModelReadmeContent>(initialContent);

  // Check if model supports serverless (based on features array)
  const supportsServerless =
    Array.isArray(model?.features) &&
    model.features.some(
      (feature: string) => feature.toLowerCase() === "serverless",
    );

  const allTabs = [
    { id: "api-usage", label: "API Usage" },
    { id: "how-to-use", label: "How to Use" },
    { id: "model-card", label: "Model Card" },
    { id: "prompting", label: "Prompting" },
    { id: "applications", label: "Applications" },
  ];

  const getTabContent = (tabId: string) => {
    if (modelConfig) {
      let configField = null;
      switch (tabId) {
        case "how-to-use":
          configField = modelConfig.howToUse;
          break;
        case "model-card":
          configField = modelConfig.modelCard;
          break;
        case "prompting":
          configField = modelConfig.promptingGuide;
          break;
        case "applications":
          configField = modelConfig.applicationsUseCases;
          break;
      }

      if (configField && configField.trim() !== "") {
        return configField;
      }
    }

    const upperTabId = tabId.toUpperCase().replace(/-/g, "_");
    const modelId = model?.id?.replaceAll("/", "-") || "";

    const possibleKeys = [
      `${upperTabId}_README_${modelId}`,
      `${upperTabId}_README_${modelId.toLowerCase()}`,
      `${upperTabId}_README_${modelId.toUpperCase()}`,
    ];

    for (const key of possibleKeys) {
      const content = modelReadmeContent[key];
      if (content && content.trim() !== "") {
        return content;
      }
    }

    return "Empty Content";
  };

  const getVisibleTabs = () => {
    return allTabs.filter((tab) => {
      // Hide API Usage tab if model doesn't support serverless
      if (tab.id === "api-usage") return supportsServerless;
      const content = getTabContent(tab.id);
      return content !== "Empty Content";
    });
  };

  const getAvailableModes = () => {
    const modes = [{ id: "chat", label: "Chat" }];

    // Only add completion mode if the model supports it
    if (model?.isCompletion) {
      modes.push({ id: "completion", label: "Completion" });
    }

    return modes;
  };

  const tabs = getVisibleTabs();

  useEffect(() => {
    // If API Usage tab is not available and it's currently active, switch to first available tab
    if (activeTab === "api-usage" && !supportsServerless) {
      const firstAvailableTab = tabs.find((tab) => tab.id !== "api-usage");
      if (firstAvailableTab) {
        setActiveTab(firstAvailableTab.id);
      }
    } else if (tabs.length > 0 && !tabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab, supportsServerless]);

  // Reset to chat mode if completion is not available
  useEffect(() => {
    if (modeTab === "completion" && !model?.isCompletion) {
      setModeTab("chat");
    }
  }, [model?.isCompletion, modeTab]);

  const codeTabs = LANGUAGE_TABS;

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const generateCode = (language: string, mode: string) => {
    const modelId = model?.id || "<Model ID>";
    const maxTokens = model?.max_output_tokens || 1000;

    // Get the code template from constants
    const codeTemplate =
      CODE_EXAMPLES[language as keyof typeof CODE_EXAMPLES]?.[
        mode as keyof typeof CODE_EXAMPLES.python
      ];

    if (!codeTemplate) {
      return "Code example not available";
    }

    // Replace placeholders with actual values
    return codeTemplate
      .replace(/<Model ID>/g, modelId)
      .replace(/max_tokens=1000/g, `max_tokens=${maxTokens}`)
      .replace(/maxTokens: 1000/g, `maxTokens: ${maxTokens}`)
      .replace(/MaxTokens: 1000/g, `MaxTokens: ${maxTokens}`)
      .replace(/"max_tokens": 1000/g, `"max_tokens": ${maxTokens}`)
      .replace(/MaxTokens:\s{3}1000/g, `MaxTokens:   ${maxTokens}`);
  };

  const getLanguage = (language: string) => {
    switch (language) {
      case "python":
        return "python";
      case "Typescript":
        return "Typescript";
      case "java":
        return "java";
      case "go":
        return "go";
      case "shell":
        return "bash";
      default:
        return "text";
    }
  };

  const renderTabContent = (tabId: string) => {
    const content = getTabContent(tabId);

    if (content === "Empty Content") {
      return (
        <div className="p-4 bg-[var(--gray-3)] rounded-lg">
          <p className="text-[var(--dark-3)] text-center">Empty Content</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-[var(--gray-2)] p-6">
        <MDDocs content={content} />
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="w-full">
        <div
          className={`flex w-full gap-2 ${
            tabs.length === 1 ? "justify-start" : ""
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            // Custom width distribution for 5 tabs
            let tabWidth;
            if (tabs.length === 1) {
              tabWidth = "auto";
            } else if (tabs.length === 5) {
              // Special width distribution for 5 tabs
              if (tab.id === "prompting") {
                tabWidth = "15%"; // Shortest text gets less space
              } else if (tab.id === "applications") {
                tabWidth = "25%"; // Longest text gets more space
              } else {
                tabWidth = "20%"; // Other tabs keep equal space
              }
            } else {
              tabWidth = `${100 / tabs.length}%`;
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`min-w-0 flex justify-center items-center px-2 py-2 h-[42px] transition-colors text-xs ${
                  isActive
                    ? "font-body-medium text-black"
                    : "font-subtle-medium text-[var(--dark-3)] hover:text-[var(--dark-2)]"
                }`}
                style={{ width: tabWidth }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Tab Indicator - Only under the active tab */}
        <div className="w-full h-px bg-[var(--gray-2)] relative">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;

            if (!isActive) return null;

            // Calculate left position and width for the indicator
            let leftPosition, indicatorWidth;
            if (tabs.length === 1) {
              leftPosition = "0%";
              indicatorWidth = "auto";
            } else if (tabs.length === 5) {
              // Calculate left position based on custom width distribution
              let leftOffset = 0;
              for (let i = 0; i < index; i++) {
                if (tabs[i].id === "prompting") {
                  leftOffset += 15;
                } else if (tabs[i].id === "applications") {
                  leftOffset += 25;
                } else {
                  leftOffset += 20;
                }
              }
              leftPosition = `${leftOffset}%`;

              // Set indicator width based on current tab
              if (tab.id === "prompting") {
                indicatorWidth = "15%";
              } else if (tab.id === "applications") {
                indicatorWidth = "25%";
              } else {
                indicatorWidth = "20%";
              }
            } else {
              leftPosition = `${(100 / tabs.length) * index}%`;
              indicatorWidth = `${100 / tabs.length}%`;
            }

            return (
              <div
                key={tab.id}
                className="absolute top-0 h-0.5 bg-[var(--brand-1)] transition-all duration-300"
                style={{
                  left: leftPosition,
                  width: indicatorWidth,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "api-usage" && supportsServerless && (
          <div className="space-y-4">
            <div className="space-y-4">
              <p className="text-[var(--dark-1)]">
                Use the following code examples to integrate with our API:
              </p>

              {/* Code Example Section */}
              <div className="border border-[var(--gray-2)] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-[var(--gray-3)] border-b border-[var(--gray-2)]">
                  <div className="flex items-center gap-4">
                    {/* Language Tabs */}
                    <Tabs value={codeTab} onValueChange={setCodeTab}>
                      <TabsList className="h-8 bg-transparent">
                        {codeTabs.map((tab) => (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="h-6 px-3 text-xs bg-transparent data-[state=active]:bg-white"
                          >
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <CopyBtn
                    content={generateCode(codeTab, modeTab)}
                    size={16}
                    className="text-[var(--dark-2)] hover:text-[var(--dark-1)]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white border-b border-[var(--gray-2)]">
                  <div className="bg-[var(--gray-3)]">
                    <Tabs value={modeTab} onValueChange={setModeTab}>
                      <TabsList className="h-8 bg-transparent">
                        {getAvailableModes().map((tab) => (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="h-6 px-3 text-xs bg-transparent data-[state=active]:bg-white"
                          >
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <SyntaxHighlighter
                    style={vs}
                    language={getLanguage(codeTab)}
                    customStyle={{
                      margin: 0,
                      backgroundColor: "transparent",
                      fontSize: "12px",
                    }}
                    showLineNumbers
                  >
                    {generateCode(codeTab, modeTab)}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "how-to-use" && (
          <div className="space-y-4">{renderTabContent("how-to-use")}</div>
        )}

        {activeTab === "model-card" && (
          <div className="space-y-4">{renderTabContent("model-card")}</div>
        )}

        {activeTab === "prompting" && (
          <div className="space-y-4">{renderTabContent("prompting")}</div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-4">{renderTabContent("applications")}</div>
        )}
      </div>
    </div>
  );
};

export default ModelUsageClient;
