import { FuncConstants } from "@/app/gpus-console/constants/funcs";

export type FuncList = Func[];

export type SampleCode = {
  lang: any;
  code: string;
};
export type Func = {
  title?: string;
  items?: Array<any>;
  info: FuncConstants;
  sampleCode?: SampleCode[];
  codeLines?: {
    [key: string]: {
      lang: string;
      line: number;
    }[];
  };
};

function createFuncsNew(): any {
  return [
    {
      title: "GPUS",
      items: [
        {
          text: "Application",
          link: "/gpus-console/application",
          selectImgSrc: "",
          unSelectImgSrc: "",
          name: "Application",
          displayName: "Application",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "TemplatesLibrary",
          link: "/gpus-console/templates-library",
          selectImgSrc: "",
          unSelectImgSrc: "",
          name: "TemplatesLibrary",
          displayName: "Templates Library",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "Explore",
          link: "/gpus-console/explore",
          selectImgSrc: "/gpu-instance/console/icon-Explore-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Explore.svg",
          name: "Explore",
          displayName: "Explore",
          playgroundReady: true,
          productpageReady: true,
        },
      ],
    },
    {
      title: "",
      items: [
        {
          text: "Instances",
          link: "/gpus-console/instances",
          selectImgSrc: "/gpu-instance/console/icon-Instances-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Instances.svg",
          name: "Instances",
          displayName: "Instances",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "Deploy Serverless",
          link: "/gpus-console/serverless-deploy",
          selectImgSrc: "/gpu-instance/console/icon-Serverless-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Serverless.svg",
          name: "ServerlessDeploy",
          displayName: "Deploy Serverless",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "Serverless",
          link: "/gpus-console/serverless",
          selectImgSrc: "/gpu-instance/console/icon-Serverless-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Serverless.svg",
          name: "Serverless",
          displayName: "Serverless GPUs",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "Image",
          link: "/gpus-console/image",
          selectImgSrc: "/gpu-instance/console/icon-Serverless-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Serverless.svg",
          name: "Image",
          displayName: "Image Prewarm",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "Storage",
          link: "/gpus-console/storage",
          selectImgSrc: "/gpu-instance/console/icon-Storage-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Storage.svg",
          name: "Storage",
          displayName: "Storage",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "Templates",
          link: "/gpus-console/templates",
          selectImgSrc: "/gpu-instance/console/icon-Templates-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Templates.svg",
          name: "Templates",
          displayName: "Templates",
          playgroundReady: true,
          productpageReady: true,
        },
        {
          text: "Jobs",
          link: "/gpus-console/jobs",
          selectImgSrc: "/gpu-instance/console/icon-Jobs-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Jobs.svg",
          name: "Jobs",
          displayName: "Jobs",
          playgroundReady: true,
          productpageReady: true,
        },
      ],
    },
    {
      title: "",
      items: [
        {
          text: "Settings",
          link: "/gpus-console/settings",
          selectImgSrc: "/gpu-instance/console/icon-Settings-Selected.svg",
          unSelectImgSrc: "/gpu-instance/console/icon-Settings.svg",
          name: "Settings",
          displayName: "Settings",
          playgroundReady: true,
          productpageReady: true,
        },
      ],
    },
  ];
}

export function getFuncsNew(): Promise<any> {
  return new Promise((resolve) => {
    resolve(createFuncsNew());
  });
}
