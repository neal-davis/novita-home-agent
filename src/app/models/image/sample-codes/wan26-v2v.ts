const js = ``;

const golang = ``;

const python = ``;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/wan2.6-v2v \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "input": {
    "prompt": "{{prompt}}",
    "reference_video_urls": ["{{reference_video_urls}}"]
  },
  "parameters": {
    "size": "{{size}}",
    "duration": {{duration}}
  }
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;
