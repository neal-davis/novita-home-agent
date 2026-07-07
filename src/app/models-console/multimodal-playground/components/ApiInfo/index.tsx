"use client";
import { CopyButton } from "../CopyButton";
interface ApiInfoProps {
  endpoint: string;
  isAsyncTask: boolean;
  formData: Record<string, any>;
}
interface CodeBlockProps {
  title: string;
  code: string;
}
const CodeBlock = ({ title, code }: CodeBlockProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-body text-[var(--dark-1)]">{title}</p>
        <CopyButton content={code} />
      </div>
      <pre className="font-p text-[var(--dark-2)] font-mono whitespace-pre-wrap break-words overflow-x-auto">
        {code}
      </pre>
    </div>
  );
};
export const ApiInfo = ({ endpoint, isAsyncTask, formData }: ApiInfoProps) => {
  const requestBody = JSON.stringify(formData, null, 2);
  const syncCurlCommand = `curl --location --request POST 'https://api.novita.ai${endpoint}' \\
--header "Content-Type: application/json" \\
--header "Authorization: Bearer \${API_KEY}" \\
--data-raw '${requestBody}'`;
  const asyncSubmitCurlCommand = `curl --location --request POST 'https://api.novita.ai${endpoint}' \\
--header "Content-Type: application/json" \\
--header "Authorization: Bearer \${API_KEY}" \\
--data-raw '${requestBody}'`;
  const asyncQueryCurlCommand = `curl --location --request GET "https://api.novita.ai/v3/async/task-result?task_id
=\${task_id}" \\
--header "Authorization: Bearer \${API_KEY}"`;
  return (
    <div className="flex flex-col gap-6">
      {isAsyncTask ? (
        <>
          <CodeBlock title={"Submit task"} code={asyncSubmitCurlCommand} />
          <CodeBlock title={"Query result"} code={asyncQueryCurlCommand} />
        </>
      ) : (
        <CodeBlock title={"Request"} code={syncCurlCommand} />
      )}
    </div>
  );
};
