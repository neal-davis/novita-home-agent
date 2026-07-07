import { CODE_OBJ as RUBY_CODE } from "./codeSamples/ruby";
import { CODE_OBJ as PYTHON_CODE } from "./codeSamples/python";
import { CODE_OBJ as PHP_CODE } from "./codeSamples/php";
import { CODE_OBJ as JAVA_CODE } from "./codeSamples/java";
import { CODE_OBJ as NODE_CODE } from "./codeSamples/node";
import { CODE_OBJ as GO_CODE } from "./codeSamples/go";
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
export function createNetworkInfo() {
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
  ruby: RUBY_CODE,
  python: PYTHON_CODE,
  php: PHP_CODE,
  java: JAVA_CODE,
  node: NODE_CODE,
  go: GO_CODE,
};
