// Chat Completions
export const pythonChatCompletions = (
  chatParams: Record<string, any> & { model: string },
  key: string,
) => {
  return `from openai import OpenAI
  
client = OpenAI(
    base_url="https://api.novita.ai/openai",
    api_key="${key}",
)

model = "${chatParams.model}"
stream = True # or False
max_tokens = ${chatParams.max_tokens}
system_content = ${chatParams.system_content}
temperature = ${chatParams.temperature}
top_p = ${chatParams.top_p}
min_p = ${chatParams.min_p}
top_k = ${chatParams.top_k}
presence_penalty = ${chatParams.presence_penalty}
frequency_penalty = ${chatParams.frequency_penalty}
repetition_penalty = ${chatParams.repetition_penalty}${
    chatParams?.response_format?.type
      ? `
response_format = { "type": "${chatParams.response_format.type}" }`
      : ""
  }

chat_completion_res = client.chat.completions.create(
    model=model,
    messages=[
        {
            "role": "system",
            "content": system_content,
        },
        {
            "role": "user",
            "content": "Hi there!",
        }
    ],
    stream=stream,
    max_tokens=max_tokens,
    temperature=temperature,
    top_p=top_p,
    presence_penalty=presence_penalty,
    frequency_penalty=frequency_penalty,${
      chatParams?.response_format?.type
        ? `
    response_format=response_format,`
        : ""
    }
    extra_body={
      "top_k": top_k,
      "repetition_penalty": repetition_penalty,
      "min_p": min_p
    }
  )

if stream:
    for chunk in chat_completion_res:
        print(chunk.choices[0].delta.content or "", end="")
else:
    print(chat_completion_res.choices[0].message.content)
  
  `;
};

export const curlChatCompletions = (
  chatParams: Record<string, any> & { model: string },
  key: string,
) => {
  return `curl "https://api.novita.ai/openai/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${key}" \\
  -d @- << 'EOF'
{
    "model": "${chatParams.model}",
    "messages": [
        {
            "role": "system",
            "content": ${chatParams.system_content}
        },
        {
            "role": "user",
            "content": "Hi there!"
        }
    ],${
      chatParams?.response_format?.type
        ? `
    "response_format": { "type": "${chatParams.response_format.type}" },`
        : ""
    }
    "max_tokens": ${chatParams.max_tokens},
    "temperature": ${chatParams.temperature},
    "top_p": ${chatParams.top_p},
    "min_p": ${chatParams.min_p},
    "top_k": ${chatParams.top_k},
    "presence_penalty": ${chatParams.presence_penalty},
    "frequency_penalty": ${chatParams.frequency_penalty},
    "repetition_penalty": ${chatParams.repetition_penalty}
}
EOF
  `;
};

export const jsChatCompletions = (
  chatParams: Record<string, any>,
  key: string,
) => {
  return `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/openai",
  apiKey: "${key}",
});
const stream = true; // or false

async function run() {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: ${chatParams.system_content},
      },
      {
        role: "user",
        content: "Hi there!",
      },
    ],
    model: "${chatParams.model}",
    stream,${
      chatParams?.response_format?.type
        ? `
    response_format: { type: "${chatParams.response_format.type}" },`
        : ""
    }
    max_tokens: ${chatParams.max_tokens},
    temperature: ${chatParams.temperature},
    top_p: ${chatParams.top_p},
    min_p: ${chatParams.min_p},
    top_k: ${chatParams.top_k},
    presence_penalty: ${chatParams.presence_penalty},
    frequency_penalty: ${chatParams.frequency_penalty},
    repetition_penalty: ${chatParams.repetition_penalty}
  });

  if (stream) {
    for await (const chunk of completion) {
      if (chunk.choices[0].finish_reason) {
        console.log(chunk.choices[0].finish_reason);
      } else {
        console.log(chunk.choices[0].delta.content);
      }
    }
  } else {
    console.log(JSON.stringify(completion));
  }
}

run();
  `;
};

// Completions
export const pythonCompletions = (
  chatParams: Record<string, any> & { model: string },
  key: string,
) => {
  return `from openai import OpenAI
  
client = OpenAI(
    base_url="https://api.novita.ai/openai",
    api_key="${key}",
)

model = "${chatParams.model}"
stream = True # or False
max_tokens = ${chatParams.max_tokens}
temperature = ${chatParams.temperature}
top_p = ${chatParams.top_p}
min_p = ${chatParams.min_p}
top_k = ${chatParams.top_k}
presence_penalty = ${chatParams.presence_penalty}
frequency_penalty = ${chatParams.frequency_penalty}
repetition_penalty = ${chatParams.repetition_penalty}

completion_res = client.completions.create(
    model=model,
    prompt="Say hello!",
    stream=stream,
    max_tokens=max_tokens,
    temperature=temperature,
    presence_penalty=presence_penalty,
    frequency_penalty=frequency_penalty,
    extra_body={
      "top_k": top_k,
      "repetition_penalty": repetition_penalty,
      "min_p": min_p
    }
  )

if stream:
    for chunk in completion_res:
        print(chunk.choices[0].text or "", end="")
else:
    print(completion_res.choices[0].text)
  
  `;
};

export const curlCompletions = (
  chatParams: Record<string, any> & { model: string },
  key: string,
) => {
  return `curl "https://api.novita.ai/openai/v1/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${key}" \\
  -d @- << 'EOF'
{
    "model": "${chatParams.model}",
    "prompt": "Say hello!",
    "max_tokens": ${chatParams.max_tokens},
    "temperature": ${chatParams.temperature},
    "top_p": ${chatParams.top_p},
    "min_p": ${chatParams.min_p},
    "top_k": ${chatParams.top_k},
    "presence_penalty": ${chatParams.presence_penalty},
    "frequency_penalty": ${chatParams.frequency_penalty},
    "repetition_penalty": ${chatParams.repetition_penalty}
}
EOF
  `;
};

export const jsCompletions = (chatParams: Record<string, any>, key: string) => {
  return `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/openai",
  apiKey: "${key}",
});
const stream = true; // or false

async function run() {
  const completion = await openai.completions.create({
    prompt: "Say hello!",
    model: "${chatParams.model}",
    stream,
    max_tokens: ${chatParams.max_tokens},
    temperature: ${chatParams.temperature},
    top_p: ${chatParams.top_p},
    min_p: ${chatParams.min_p},
    top_k: ${chatParams.top_k},
    presence_penalty: ${chatParams.presence_penalty},
    frequency_penalty: ${chatParams.frequency_penalty},
    repetition_penalty: ${chatParams.repetition_penalty}
  });

  if (stream) {
    for await (const chunk of completion) {
      if (chunk.choices[0].finish_reason) {
        console.log(chunk.choices[0].finish_reason);
      } else {
        console.log(chunk.choices[0].text);
      }
    }
  } else {
    console.log(JSON.stringify(completion));
  }
}

run();
  `;
};

// Response Mode
export const pythonResponse = (
  chatParams: Record<string, any> & { model: string },
  key: string,
) => {
  return `from openai import OpenAI
  
client = OpenAI(
    base_url="https://api.novita.ai/openai",
    api_key="${key}",
)

model = "${chatParams.model}"
max_output_tokens = ${chatParams.max_output_tokens}
temperature = ${chatParams.temperature}
parallel_tool_calls = ${chatParams.parallel_tool_calls ? "True" : "False"}
max_tool_calls = ${chatParams.max_tool_calls}

response = client.responses.create(
    model=model,
    input=[
        {
            "role": "user",
            "content": "Explain the concept of machine learning in simple terms.",
        }
    ],
    max_output_tokens=max_output_tokens,
    temperature=temperature,
    parallel_tool_calls=parallel_tool_calls,
    max_tool_calls=max_tool_calls
)

print(response.choices[0].message.content)
  
  `;
};

export const curlResponse = (
  chatParams: Record<string, any> & { model: string },
  key: string,
) => {
  return `curl "https://api.novita.ai/openai/v1/responses" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${key}" \\
  -d @- << 'EOF'
{
    "model": "${chatParams.model}",
    "input": [
        {
            "role": "user",
            "content": "Explain the concept of machine learning in simple terms."
        }
    ],
    "max_output_tokens": ${chatParams.max_output_tokens},
    "temperature": ${chatParams.temperature},
    "parallel_tool_calls": ${chatParams.parallel_tool_calls},
    "max_tool_calls": ${chatParams.max_tool_calls}
}
EOF
  `;
};

export const jsResponse = (chatParams: Record<string, any>, key: string) => {
  return `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/openai",
  apiKey: "${key}",
});

async function run() {
  const response = await openai.responses.create({
    input: [
      {
        role: "user",
        content: "Explain the concept of machine learning in simple terms.",
      },
    ],
    model: "${chatParams.model}",
    max_output_tokens: ${chatParams.max_output_tokens},
    temperature: ${chatParams.temperature},
    parallel_tool_calls: ${chatParams.parallel_tool_calls},
    max_tool_calls: ${chatParams.max_tool_calls}
  });

  console.log(response.choices[0].message.content);
}

run();
  `;
};
