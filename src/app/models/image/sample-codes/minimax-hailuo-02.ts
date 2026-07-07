const js = ``;

const golang = ``;

const python = ``;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/minimax-hailuo-02 \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "image_url": "{{image_url}}",
  "prompt": "{{prompt}}",
  "duration": {{duration}},
  "resolution": "{{resolution}}",
  "enable_prompt_expansion": {{enable_prompt_expansion}}
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;
