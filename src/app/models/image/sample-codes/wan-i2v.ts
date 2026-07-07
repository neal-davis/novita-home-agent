const js = ``;

const golang = ``;

const python = ``;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/wan-i2v \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "model_name": "{{model_name}}",
  "image_url": "{{image_url}}",
  "width": {{width}},
  "height": {{height}},
  "seed": {{seed}},
  "prompt": "{{prompt}}"
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;
