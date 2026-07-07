type FunctionDefinition = {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required: string[];
};

export function createMockGenerationPrompt(
  functionDefinition: FunctionDefinition,
  parameters: Record<string, any>,
): string {
  return `You are a mock data generator. Generate realistic mock data for a function call based on the function definition and parameters provided.

Function Definition:
- Name: ${functionDefinition.name}
- Description: ${functionDefinition.description}
- Parameters Schema: ${JSON.stringify(functionDefinition.parameters, null, 2)}

Actual Parameters Provided:
${JSON.stringify(parameters, null, 2)}

Instructions:
Only return the JSON object, no other text or explanations.
1. Generate realistic mock data that would be returned by this function
2. The mock data should be consistent with the function's purpose and description
3. Use the provided parameters to customize the mock data appropriately
4. Make the data realistic and varied, not just generic placeholders
5. Keep the response short and concise - if returning arrays, limit to maximum 3 items
6. Return ONLY a valid JSON object as the response
7. Do not include any markdown formatting or explanations`;
}
