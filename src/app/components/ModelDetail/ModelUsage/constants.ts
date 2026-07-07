// Code examples for different languages and modes
export const CODE_EXAMPLES = {
  python: {
    chat: `from openai import OpenAI

client = OpenAI(
    api_key="<Your API Key>",
    base_url="https://api.novita.ai/openai"
)

response = client.chat.completions.create(
    model="<Model ID>",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
    ],
    max_tokens=1000,
    temperature=0.7
)

print(response.choices[0].message.content)`,
    completion: `from openai import OpenAI

client = OpenAI(
    api_key="<Your API Key>",
    base_url="https://api.novita.ai/openai"
)

response = client.completions.create(
    model="<Model ID>",
    prompt="The following is a conversation with an AI assistant.",
    max_tokens=1000,
    temperature=0.7
)

print(response.choices[0].text)`,
  },
  Typescript: {
    chat: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '<Your API Key>',
  baseURL: 'https://api.novita.ai/openai'
});

const response = await openai.chat.completions.create({
  model: '<Model ID>',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, how are you?' }
  ],
  max_tokens: 1000,
  temperature: 0.7
});

console.log(response.choices[0].message.content);`,
    completion: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '<Your API Key>',
  baseURL: 'https://api.novita.ai/openai'
});

const response = await openai.completions.create({
  model: '<Model ID>',
  prompt: 'The following is a conversation with an AI assistant.',
  max_tokens: 1000,
  temperature: 0.7
});

console.log(response.choices[0].text);`,
  },
  java: {
    chat: `import com.openai.OpenAI;
import com.openai.models.*;

OpenAI client = new OpenAI("<Your API Key>", "https://api.novita.ai/openai");

ChatCompletionRequest request = ChatCompletionRequest.builder()
    .model("<Model ID>")
    .messages(Arrays.asList(
        new ChatMessage("system", "You are a helpful assistant."),
        new ChatMessage("user", "Hello, how are you?")
    ))
    .maxTokens(1000)
    .temperature(0.7)
    .build();

ChatCompletion response = client.chatCompletions().create(request);
System.out.println(response.getChoices().get(0).getMessage().getContent());`,
    completion: `import com.openai.OpenAI;
import com.openai.models.*;

OpenAI client = new OpenAI("<Your API Key>", "https://api.novita.ai/openai");

CompletionRequest request = CompletionRequest.builder()
    .model("<Model ID>")
    .prompt("The following is a conversation with an AI assistant.")
    .maxTokens(1000)
    .temperature(0.7)
    .build();

Completion response = client.completions().create(request);
System.out.println(response.getChoices().get(0).getText());`,
  },
  go: {
    chat: `package main

import (
    "context"
    "fmt"
    "github.com/openai/openai-go"
)

func main() {
    client := openai.NewClient("<Your API Key>", "https://api.novita.ai/openai")
    
    messages := []openai.ChatMessage{
        {Role: "system", Content: "You are a helpful assistant."},
        {Role: "user", Content: "Hello, how are you?"},
    }
    
    response, err := client.ChatCompletions.Create(context.Background(), openai.ChatCompletionRequest{
        Model:       "<Model ID>",
        Messages:    messages,
        MaxTokens:   1000,
        Temperature: 0.7,
    })
    
    if err != nil {
        panic(err)
    }
    
    fmt.Println(response.Choices[0].Message.Content)
}`,
    completion: `package main

import (
    "context"
    "fmt"
    "github.com/openai/openai-go"
)

func main() {
    client := openai.NewClient("<Your API Key>", "https://api.novita.ai/openai")
    
    response, err := client.Completions.Create(context.Background(), openai.CompletionRequest{
        Model:       "<Model ID>",
        Prompt:      "The following is a conversation with an AI assistant.",
        MaxTokens:   1000,
        Temperature: 0.7,
    })
    
    if err != nil {
        panic(err)
    }
    
    fmt.Println(response.Choices[0].Text)
}`,
  },
  shell: {
    chat: `#!/bin/bash

API_KEY="<Your API Key>"
MODEL_ID="<Model ID>"
BASE_URL="https://api.novita.ai/openai"

curl -X POST "$BASE_URL/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{
    "model": "'$MODEL_ID'",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "max_tokens": 1000,
    "temperature": 0.7
  }'`,
    completion: `#!/bin/bash

API_KEY="<Your API Key>"
MODEL_ID="<Model ID>"
BASE_URL="https://api.novita.ai/openai"

curl -X POST "$BASE_URL/v1/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{
    "model": "'$MODEL_ID'",
    "prompt": "The following is a conversation with an AI assistant.",
    "max_tokens": 1000,
    "temperature": 0.7
  }'`,
  },
};

export const LANGUAGE_TABS = [
  { id: "python", label: "Python" },
  { id: "Typescript", label: "Typescript" },
  { id: "java", label: "Java" },
  { id: "go", label: "Go" },
  { id: "shell", label: "Shell" },
];
