export const LANGUAGE_MAP = [
  {
    text: "Python",
    iconName: "python",
  },
  {
    text: "Ruby",
    iconName: "ruby",
  },
  {
    text: "PHP",
    iconName: "php",
  },
  {
    text: "Java",
    iconName: "java",
  },
  {
    text: "Node.js",
    iconName: "node",
  },
  {
    text: "Go",
    iconName: "go",
  },
];
export const fileExtra: any = {
  python: "py",
  ruby: "rb",
  php: "php",
  java: "java",
  node: "js",
  go: "go",
};
// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getNetworkInfo() {
  return [
    {
      name: "Products",
      values: [
        {
          text: "GPU Cloud",
          isEmail: false,
          url: "/console/explore",
        },
      ],
    },
    {
      name: "Resources",
      values: [
        {
          text: "Pricing",
          isEmail: false,
          url: "/pricing",
        },
        {
          text: "Docs",
          isEmail: false,
          url: "https://docs.infrai.com/quickstart/start",
        },
        {
          text: "FAQ",
          isEmail: false,
          url: "https://docs.infrai.com/FAQ/intro",
        },
      ],
    },
    {
      name: "Legal",
      values: [
        {
          text: "Terms of Service",
          isEmail: false,
          url: "https://docs.infrai.com/terms/service",
        },
        {
          text: "Privacy Policy",
          isEmail: false,
          url: "https://docs.infrai.com/terms/policy",
        },
      ],
    },
    {
      name: "Contact",
      values: [
        {
          text: "Contact us",
          url: "/contact",
          isEmail: false,
        },
        {
          text: "Discord",
          isEmail: false,
          url: "https://discord.gg/yntJ6VEX2J",
        },
        {
          text: "X",
          isEmail: false,
          url: "https://twitter.com/infrai_cloud",
        },
        {
          text: "support@infrai.com",
          isEmail: true,
          url: "mailto:support@infrai.com",
        },
      ],
    },
  ];
}
export const CODE_OBJ: any = {
  ruby: [
    {
      text: "require ",
      cssName: "blue",
    },
    {
      text: '"uri"',
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "require ",
      cssName: "blue",
    },
    {
      text: '"net/http"',
      cssName: "green",
    },
    {
      text: "",
      cssName: "block",
    },
    {
      text: "url",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "URI(",
      cssName: "yellow",
    },
    {
      text: '"/v1/gpu/instances?pageSize=1&pageNum=',
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: '10&productName=4090"',
      cssName: "green",
    },
    {
      text: ")",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "http",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "Net",
      cssName: "yellow",
    },
    {
      text: "::",
      cssName: "white",
    },
    {
      text: "HTTP.",
      cssName: "yellow",
    },
    {
      text: "new",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "url.host,",
      cssName: "white",
    },
    {
      text: " url.port",
      cssName: "white",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "request",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "Net",
      cssName: "yellow",
    },
    {
      text: "::",
      cssName: "white",
    },
    {
      text: "HTTP.",
      cssName: "yellow",
    },
    {
      text: "Get.",
      cssName: "yellow",
    },
    {
      text: "new",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "url",
      cssName: "white",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "request",
      cssName: "white",
    },
    {
      text: "[",
      cssName: "yellow",
    },
    {
      text: '"Authorization"',
      cssName: "green",
    },
    {
      text: "]",
      cssName: "yellow",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: '"Bearer {{API Key}}"',
      cssName: "green",
    },
    {
      text: "",
      cssName: "block",
    },
    {
      text: "response",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "http.",
      cssName: "white",
    },
    {
      text: "request",
      cssName: "white",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "request",
      cssName: "white",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "puts ",
      cssName: "blue",
    },
    {
      text: "response.",
      cssName: "white",
    },
    {
      text: "read_",
      cssName: "white",
    },
    {
      text: "body",
      cssName: "white",
    },
  ],
  python: [
    {
      text: "import ",
      cssName: "purple",
    },
    {
      text: "http.",
      cssName: "white",
    },
    {
      text: "client",
      cssName: "white",
    },
    {
      text: "",
      cssName: "block",
    },
    {
      text: "conn",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "http.",
      cssName: "white",
    },
    {
      text: "client.",
      cssName: "white",
    },
    {
      text: "HTTPSConnection",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: '""',
      cssName: "green",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "payload",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "''",
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "headers",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "{",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "'Authorization'",
      cssName: "green",
    },
    {
      text: ": ",
      cssName: "white",
    },
    {
      text: "'",
      cssName: "green",
    },
    {
      text: "Bearer {{",
      cssName: "yellow",
    },
    {
      text: "API Key",
      cssName: "green",
    },
    {
      text: "}}",
      cssName: "yellow",
    },
    {
      text: "'",
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "}",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "conn.",
      cssName: "white",
    },
    {
      text: "request",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: '"GET"',
      cssName: "green",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: '"/v1/gpu/instances?pageSize',
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: '=1&pageNum=10&productName=4090"',
      cssName: "green",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: "payload, ",
      cssName: "white",
    },
    {
      text: "headers, ",
      cssName: "white",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "res",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "conn.",
      cssName: "white",
    },
    {
      text: "getresponse",
      cssName: "blue",
    },
    {
      text: "()",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "data",
      cssName: "white",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "res.",
      cssName: "white",
    },
    {
      text: "read",
      cssName: "blue",
    },
    {
      text: "()",
      cssName: "yellow",
    },
    // {
    //     text: '',
    //     cssName: 'smallBlock'
    // },
    // {
    //     text: 'print',
    //     cssName: 'blue'
    // },
    // {
    //     text: "(",
    //     cssName: 'yellow'
    // },
    // {
    //     text: 'data.',
    //     cssName: 'white'
    // },
    // {
    //     text: 'decode',
    //     cssName: 'blue'
    // },
    // {
    //     text: '(',
    //     cssName: 'red'
    // },
    // {
    //     text: '"utf-8"',
    //     cssName: 'green'
    // },
    // {
    //     text: ')',
    //     cssName: 'red'
    // },
    // {
    //     text: ')',
    //     cssName: 'yellow'
    // }
  ],
  php: [
    {
      text: "$curl",
      cssName: "red",
    },
    {
      text: " = ",
      cssName: "blueGreen",
    },
    {
      text: "curl_init",
      cssName: "blue",
    },
    {
      text: "()",
      cssName: "yellow",
    },
    {
      text: ";",
      cssName: "white",
    },
    {
      text: "",
      cssName: "block",
    },
    {
      text: "curl_setopt_array",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "$curl",
      cssName: "red",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: "array",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_URL",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "'/v1/gpu/instances?pageSize=1&pageNum=10&productName=4090'",
      cssName: "green",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_RETURNTRANSFER",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "true",
      cssName: "yellow",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_ENCODING",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "''",
      cssName: "green",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_MAXREDIRS",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "10",
      cssName: "yellow",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_TIMEOUT",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "0",
      cssName: "yellow",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_FOLLOWLOCATION",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "true",
      cssName: "yellow",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_HTTP_VERSION",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "CURL_HTTP_VERSION_1_1",
      cssName: "yellow",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_CUSTOMREQUEST",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "'GET'",
      cssName: "green",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "CURLOPT_HTTPHEADER",
      cssName: "white",
    },
    {
      text: " => ",
      cssName: "white",
    },
    {
      text: "array(",
      cssName: "blue",
    },
    // {
    //     text: '',
    //     cssName: 'smallBlock'
    // },
    // {
    //     text: '',
    //     cssName: 'smallBlock'
    // },
    // {
    //     text: '',
    //     cssName: 'kongGe'
    // },
    // {
    //     text: "'x-user-id: {{user_id}}'",
    //     cssName: 'green'
    // },
    // {
    //     text: ",",
    //     cssName: 'white'
    // },
    // {
    //     text: '',
    //     cssName: 'smallBlock'
    // },
    // {
    //     text: '',
    //     cssName: 'kongGe2'
    // },
    // {
    //     text: "'x-appid: {{app_id}}'",
    //     cssName: 'green'
    // },
    // {
    //     text: ",",
    //     cssName: 'white'
    // },
    // {
    //     text: '',
    //     cssName: 'smallBlock'
    // },
    // {
    //     text: '',
    //     cssName: 'kongGe2'
    // },
    // {
    //     text: "'User-Agent: Apifox/1.0.0 (https://apifox.com)'",
    //     cssName: 'green'
    // },
    // {
    //     text: '',
    //     cssName: 'smallBlock'
    // },
    // {
    //     text: ')',
    //     cssName: 'blue'
    // },
    // {
    //     text: ',',
    //     cssName: 'white'
    // },
    // {
    //     text: '',
    //     cssName: 'smallBlock'
    // },
    // {
    //     text: ')',
    //     cssName: 'purple',
    // },
    // {
    //     text: ')',
    //     cssName: 'yellow'
    // },
    // {
    //     text: ';',
    //     cssName: 'white'
    // }
  ],
  java: [
    {
      text: "Unirest",
      cssName: "yellow",
    },
    {
      text: ".",
      cssName: "",
    },
    {
      text: "setTimeouts",
      cssName: "blue",
    },
    {
      text: "(0",
      cssName: "yellow",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: "0)",
      cssName: "yellow",
    },
    {
      text: ";",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "HttpResponse",
      cssName: "yellow",
    },
    {
      text: "<",
      cssName: "white",
    },
    {
      text: "String",
      cssName: "yellow",
    },
    {
      text: "> ",
      cssName: "white",
    },
    {
      text: "response",
      cssName: "red",
    },
    {
      text: " = ",
      cssName: "green",
    },
    {
      text: "Unirest",
      cssName: "yellow",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "get",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: '"/v1/gpu/instances?pageSize=1&pageNum=10&',
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: 'productName=4090"',
      cssName: "green",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "header",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: '"Authorization"',
      cssName: "green",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: '"Bearer {{API Key}}"',
      cssName: "green",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "asString",
      cssName: "blue",
    },
    {
      text: "()",
      cssName: "yellow",
    },
    {
      text: ";",
      cssName: "white",
    },
  ],
  node: [
    {
      text: "var ",
      cssName: "purple",
    },
    {
      text: "myHeaders",
      cssName: "red",
    },
    {
      text: " =  ",
      cssName: "blue",
    },
    {
      text: "new ",
      cssName: "purple",
    },
    {
      text: "Headers",
      cssName: "brightYellow",
    },
    {
      text: "()",
      cssName: "yellow",
    },
    {
      text: ";",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "myHeaders",
      cssName: "red",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "append",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: '"Authorization"',
      cssName: "green",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: '"Bearer {{API Key}}"',
      cssName: "green",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: ";",
      cssName: "white",
    },
    {
      text: "",
      cssName: "block",
    },
    {
      text: "var ",
      cssName: "purple",
    },
    {
      text: "requestOptions",
      cssName: "red",
    },
    {
      text: " = ",
      cssName: "blue",
    },
    {
      text: "{",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "method",
      cssName: "red",
    },
    {
      text: ": ",
      cssName: "white",
    },
    {
      text: "'GET'",
      cssName: "green",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "headers",
      cssName: "red",
    },
    {
      text: ": ",
      cssName: "white",
    },
    {
      text: "myHeaders",
      cssName: "red",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "redirect",
      cssName: "red",
    },
    {
      text: ": ",
      cssName: "white",
    },
    {
      text: "'follow'",
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "}",
      cssName: "yellow",
    },
    {
      text: ";",
      cssName: "white",
    },
    {
      text: "",
      cssName: "block",
    },
    {
      text: "fetch",
      cssName: "weightGreen",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: '"/v1/gpu/instances?pageSize=1&pageNum=10&productName=4090"',
      cssName: "green",
    },
    {
      text: ",",
      cssName: "white",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "requestOptions",
      cssName: "red",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "then",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "response",
      cssName: "red",
    },
    {
      text: " => ",
      cssName: "purple",
    },
    {
      text: "response",
      cssName: "red",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "text",
      cssName: "blue",
    },
    {
      text: "()",
      cssName: "purple",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "block",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "then",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "result",
      cssName: "red",
    },
    {
      text: " => ",
      cssName: "purple",
    },
    {
      text: "console",
      cssName: "yellow",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "log",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "purple",
    },
    {
      text: "result",
      cssName: "red",
    },
    {
      text: ")",
      cssName: "purple",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "catch",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "yellow",
    },
    {
      text: "error",
      cssName: "red",
    },
    {
      text: " => ",
      cssName: "purple",
    },
    {
      text: "console",
      cssName: "yellow",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "log",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "purple",
    },
    {
      text: "'error",
      cssName: "green",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: "error",
      cssName: "red",
    },
    {
      text: ")",
      cssName: "purple",
    },
    {
      text: ")",
      cssName: "yellow",
    },
    {
      text: ";",
      cssName: "white",
    },
  ],
  go: [
    {
      text: "func",
      cssName: "purple",
    },
    {
      text: " main",
      cssMame: "blue",
    },
    {
      text: "() {",
      cssName: "yellow",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "url",
      cssName: "red",
    },
    {
      text: " := ",
      cssMame: "yellow",
    },
    {
      text: '"/v1/gpu/instances?pageSize=1&pageNum=10&productName=4090"',
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "method",
      cssName: "red",
    },
    {
      text: " := ",
      cssMame: "yellow",
    },
    {
      text: '"GET"',
      cssName: "green",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "client",
      cssName: "red",
    },
    {
      text: " := ",
      cssMame: "yellow",
    },
    {
      text: "&",
      cssName: "purple",
    },
    {
      text: "http",
      cssName: "red",
    },
    {
      text: ".",
      cssMame: "white",
    },
    {
      text: "Client ",
      cssName: "red",
    },
    {
      text: "{}",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "req",
      cssName: "red",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: "err",
      cssMame: "red",
    },
    {
      text: " :=  ",
      cssName: "yellow",
    },
    {
      text: "http",
      cssName: "red",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "NewRequest",
      cssMame: "blue",
    },
    {
      text: "(",
      cssName: "purple",
    },
    {
      text: "method",
      cssName: "red",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: "url",
      cssName: "red",
    },
    {
      text: ", ",
      cssMame: "white",
    },
    {
      text: "nil",
      cssName: "yellow",
    },
    {
      text: ")",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "req",
      cssMame: "red",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "Header",
      cssName: "red",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "Add",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "purple",
    },
    {
      text: '"Authorization"',
      cssName: "green",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: '"Bearer {{API Key}}"',
      cssName: "green",
    },
    {
      text: ")",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "res",
      cssMame: "red",
    },
    {
      text: ", ",
      cssName: "white",
    },
    {
      text: "err",
      cssName: "red",
    },
    {
      text: " := ",
      cssName: "yellow",
    },
    {
      text: "client",
      cssName: "red",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "Do",
      cssName: "blue",
    },
    {
      text: "(",
      cssName: "purple",
    },
    {
      text: "req",
      cssName: "red",
    },
    {
      text: ")",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "if ",
      cssMame: "purple",
    },
    {
      text: "err ",
      cssName: "red",
    },
    {
      text: "!= ",
      cssName: "green",
    },
    {
      text: "nil ",
      cssName: "yellow",
    },
    {
      text: "{",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: "fmt",
      cssName: "red",
    },
    {
      text: ".",
      cssName: "white",
    },
    {
      text: "Println(",
      cssName: "blue",
    },
    {
      text: "err",
      cssName: "red",
    },
    {
      text: ")",
      cssName: "blue",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe2",
    },
    {
      text: "return",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "}",
      cssName: "purple",
    },
    {
      text: "",
      cssName: "smallBlock",
    },
    {
      text: "",
      cssName: "kongGe",
    },
    {
      text: "defer ",
      cssName: "purple",
    },
    {
      text: "res",
      cssName: "red",
    },
    {
      text: ".",
      cssMame: "white",
    },
    {
      text: "Body",
      cssName: "red",
    },
    {
      text: ".",
      cssMame: "white",
    },
    {
      text: "Close",
      cssName: "blue",
    },
    {
      text: "()",
      cssMame: "purple",
    },
  ],
};
