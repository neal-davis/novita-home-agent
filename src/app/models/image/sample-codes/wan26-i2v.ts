const js = ``;

const golang = ``;

const python = ``;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/wan2.6-i2v \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "input": {
    "prompt": "{{prompt}}",
    "img_url": "{{img_url}}"
  },
  "parameters": {
    "resolution": "{{resolution}}",
    "duration": {{duration}}
  }
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;
