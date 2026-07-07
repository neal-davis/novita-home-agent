import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { useState, forwardRef, useImperativeHandle } from "react";
import { FunctionDefinition } from "@/app/api/type";

// Template definitions
export const functionTemplates: FunctionDefinition[] = [
  {
    name: "get_weather",
    description: "Get current weather information for a specified location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name",
        },
        unit: {
          type: "string",
          enum: ["c", "f"],
          description: "Temperature unit",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "simple_calculator",
    description:
      "Perform basic arithmetic operations: addition, subtraction, multiplication, and division.",
    parameters: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          description:
            "The type of operation to perform. Valid options are: add, subtract, multiply, divide.",
          enum: ["add", "subtract", "multiply", "divide"],
        },
        a: {
          type: "number",
          description: "The first number.",
        },
        b: {
          type: "number",
          description: "The second number.",
        },
      },
      required: ["operation", "a", "b"],
    },
  },
];

type ValidationError = {
  message: string;
  path?: string;
};

// Interface for methods exposed to parent component
export type LLMToolsRef = {
  getTools: () => FunctionDefinition[];
  setTools: (tools: FunctionDefinition[]) => void;
  clearTools: () => void;
};

interface LLMToolsProps {}

export const LLMTools = forwardRef<LLMToolsRef, LLMToolsProps>((props, ref) => {
  const [tools, setTools] = useState<FunctionDefinition[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<FunctionDefinition | null>(
    null,
  );
  const [jsonText, setJsonText] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [isValid, setIsValid] = useState<boolean>(true);

  // Expose methods to parent component
  useImperativeHandle(
    ref,
    () => ({
      getTools: () => tools,
      setTools: (newTools: FunctionDefinition[]) => setTools(newTools),
      clearTools: () => setTools([]),
    }),
    [tools],
  );

  // JSON validation function
  const validateJsonSchema = (
    jsonString: string,
  ): {
    isValid: boolean;
    errors: ValidationError[];
    parsedData?: FunctionDefinition;
  } => {
    const errors: ValidationError[] = [];

    try {
      const parsed = JSON.parse(jsonString);

      // Check required fields
      if (!parsed.name || typeof parsed.name !== "string") {
        errors.push({
          message: "name field is required and must be a string",
          path: "name",
        });
      }

      if (!parsed.description || typeof parsed.description !== "string") {
        errors.push({
          message: "description field is required and must be a string",
          path: "description",
        });
      }

      if (!parsed.parameters || typeof parsed.parameters !== "object") {
        errors.push({
          message: "parameters field is required and must be an object",
          path: "parameters",
        });
      } else {
        // Check parameters structure
        if (parsed.parameters.type !== "object") {
          errors.push({
            message: 'parameters.type must be "object"',
            path: "parameters.type",
          });
        }

        if (
          !parsed.parameters.properties ||
          typeof parsed.parameters.properties !== "object"
        ) {
          errors.push({
            message: "parameters.properties must be an object",
            path: "parameters.properties",
          });
        }

        if (
          parsed.parameters.required &&
          !Array.isArray(parsed.parameters.required)
        ) {
          errors.push({
            message: "parameters.required must be an array",
            path: "parameters.required",
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        parsedData:
          errors.length === 0
            ? {
                name: parsed.name,
                description: parsed.description,
                parameters: parsed.parameters,
              }
            : undefined,
      };
    } catch (e) {
      return {
        isValid: false,
        errors: [{ message: "Invalid JSON format: " + (e as Error).message }],
      };
    }
  };

  // Real-time JSON validation
  const handleJsonChange = (value: string) => {
    setJsonText(value);
    const validation = validateJsonSchema(value);
    setValidationErrors(validation.errors);
    setIsValid(validation.isValid);
  };

  // Add or update tool
  const handleSaveTool = () => {
    const validation = validateJsonSchema(jsonText);
    if (validation.isValid && validation.parsedData) {
      if (editingTool) {
        // Update existing tool
        setTools((prev) =>
          prev.map((tool) =>
            tool.name === editingTool.name ? validation.parsedData! : tool,
          ),
        );
      } else {
        // Add new tool
        const existingTool = tools.find(
          (tool) => tool.name === validation.parsedData!.name,
        );
        if (existingTool) {
          setValidationErrors([
            {
              message: `Function name "${
                validation.parsedData!.name
              }" already exists`,
            },
          ]);
          return;
        }
        setTools((prev) => [...prev, validation.parsedData!]);
      }
      handleCloseDialog();
    }
  };

  // Delete tool
  const handleDeleteTool = (toolName: string) => {
    setTools((prev) => prev.filter((tool) => tool.name !== toolName));
  };

  // Edit tool
  const handleEditTool = (tool: FunctionDefinition) => {
    const toolJson = JSON.stringify(
      {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
      null,
      2,
    );

    setEditingTool(tool);
    setJsonText(toolJson);
    setValidationErrors([]);
    setIsValid(true);
    setDialogOpen(true);
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setEditingTool(null);
    setJsonText("");
    setValidationErrors([]);
    setIsValid(true);
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTool(null);
    setJsonText("");
    setValidationErrors([]);
    setIsValid(true);
  };

  // Use template
  const handleSelectTemplate = (templateKey: string) => {
    if (
      templateKey &&
      functionTemplates[templateKey as keyof typeof functionTemplates]
    ) {
      const template =
        functionTemplates[templateKey as keyof typeof functionTemplates];
      setJsonText(JSON.stringify(template, null, 2));
      handleJsonChange(JSON.stringify(template, null, 2));
    }
  };

  return (
    <div className="mt-4">
      <div className="space-y-1">
        <div className="font-semibold">Functions</div>
        <div className="text-common-dark-1 text-sm">
          JsonSchema definitions sent to the model
        </div>
      </div>

      {/* Tool list */}
      <div className="space-y-1 my-2">
        {tools.map((tool) => (
          <Card
            key={tool.name}
            className="p-3 cursor-pointer"
            onClick={() => handleEditTool(tool)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-common-dark-1">{tool.name}</h3>
                </div>
                <div className="text-xs text-common-gray-1">
                  Parameters:{" "}
                  {Object.keys(tool.parameters.properties || {}).join(", ") ||
                    "None"}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="noborderoutline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTool(tool.name);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add function button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenAddDialog} variant={"outline"}>
            <Plus className="h-4 w-4 mr-2" />
            Add Function
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? "Edit Function" : "Add Function"}
            </DialogTitle>
            <DialogDescription>
              {editingTool
                ? `Edit JSON schema definition for function "${editingTool.name}"`
                : "Add JSON schema for a function below. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-hidden">
            {/* Template selection */}
            {!editingTool && (
              <div>
                <Label>Select Template (Optional)</Label>
                <Select onValueChange={handleSelectTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template function" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(functionTemplates).map(
                      ([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name} - {template.description}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* JSON editing area */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Label>JSON Schema</Label>
                {isValid ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Format correct
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Format error
                  </div>
                )}
              </div>
              <Textarea
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="font-mono text-sm resize-none h-80"
                placeholder="Enter JSON schema..."
              />
            </div>

            {/* Error message */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <div key={index}>
                        {error.path ? `${error.path}: ` : ""}
                        {error.message}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTool}
              disabled={!isValid || !jsonText.trim()}
            >
              {editingTool ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

LLMTools.displayName = "LLMTools";
