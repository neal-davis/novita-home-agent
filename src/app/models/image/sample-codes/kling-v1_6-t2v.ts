const js = ``;

const golang = ``;

const python = ``;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/kling-v1.6-t2v \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "mode": "{{mode}}",
  "duration": {{duration}},
  "prompt": "{{prompt}}",
  "negative_prompt": "{{negative_prompt}}",
  "guidance_scale": {{guidance_scale}}
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;
