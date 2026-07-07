type TextValue = {
  text: string | number;
};

type LabelValue = {
  label: string;
};

export type GpuData = {
  model: string;
  title: string;
  description: string;
  params: {
    model: TextValue;
    gpuArch: TextValue;
    vram: TextValue;
    cudaCore: number;
    busWidth: TextValue;
    memoryBandwidth: TextValue;
    rtCore: TextValue;
    tensorCore: TextValue;
    boostClock: TextValue;
    computingPower: TextValue;
  };
  performanceEval?: {
    description: string;
    products: Array<{
      name: string;
      indicators: Array<{ name: string; value: string | number }>;
    }>;
  };
};

export type GpuLandingPageContent = {
  getStartedButton: LabelValue;
  discordButton: LabelValue;
  pricing: {
    title: string;
    coupon: TextValue;
    onDemand: LabelValue;
    limited: LabelValue;
    subjectPrice: TextValue;
    hour: LabelValue;
    second: LabelValue;
  };
  performanceParameters: {
    title: string;
    gpuArch: LabelValue;
    tensorCore: LabelValue;
    boostClock: LabelValue;
    cudaCore: LabelValue;
    memBandwidth: LabelValue;
    busWidth: LabelValue;
    rtCore: LabelValue;
    vRam: LabelValue;
    compPower: LabelValue;
  };
  performanceEvaluation: {
    title: string;
    intro: TextValue;
    base: TextValue;
    baseWebUI: LabelValue;
  };
  advantage: {
    title: string;
    description: string;
    items: Array<{ icon: string; title: string; description: string }>;
  };
  contact: {
    title: string;
    join: { title: string; description: string };
    getStarted: { title: string; description: string };
  };
  gpuData: Record<string, GpuData>;
};

export function createGpuLandingPageContent(): GpuLandingPageContent {
  return {
    getStartedButton: {
      label: "Start Building Now",
    },
    discordButton: {
      label: "Join Discord",
    },
    pricing: {
      title: "Pricing",
      coupon: {
        text: "Complete your registration information and receive large coupons",
      },
      onDemand: {
        label: "On-Demand",
      },
      limited: {
        label: "Limited time offer",
      },
      subjectPrice: {
        text: "The specific price is subject to the computing power market.",
      },
      hour: {
        label: "hr",
      },
      second: {
        label: "sec",
      },
    },
    performanceParameters: {
      title: "Performance Parameters",
      gpuArch: {
        label: "GPU Architecture",
      },
      tensorCore: {
        label: "Tensor Core",
      },
      boostClock: {
        label: "Boost Clock",
      },
      cudaCore: {
        label: "CUDA Core",
      },
      memBandwidth: {
        label: "Memory Bandwidth",
      },
      busWidth: {
        label: "Bus Width",
      },
      rtCore: {
        label: "RT Core",
      },
      vRam: {
        label: "vRAM",
      },
      compPower: {
        label: "Computing Power",
      },
    },
    performanceEvaluation: {
      title: "Performance Evaluation",
      intro: {
        text: "GPU Cloud provides highly available and cost-effective GPU cloud services",
      },
      base: {
        text: "Evaluating the performance of Vincent graphs based on Stable Diffusion",
      },
      baseWebUI: {
        label: "Based on WebUI",
      },
    },
    advantage: {
      title: "GPU Instance Advantage",
      description:
        "Empowering AI innovation with cost-efficient, easy-access GPU cloud.",
      items: [
        {
          icon: "/gpu-instance/gpu-landingpage/cost.svg",
          title: "Lower Costs",
          description:
            "By leveraging large-scale computational power, integrating third-party resources, and using consumer-grade GPUs, we can offer our customers highly cost-effective GPU computing resources. This makes powerful computing accessible to small and medium-sized businesses and even startups.",
        },
        {
          icon: "/gpu-instance/gpu-landingpage/secure.svg",
          title: "Higher Security",
          description:
            "We implement multiple layers of security measures, including data encryption and access control, to ensure the safety and privacy of your data. Additionally, we conduct regular security audits to address cybersecurity threats, providing you with a secure and trustworthy cloud service environment.",
        },
        {
          icon: "/gpu-instance/gpu-landingpage/stable.svg",
          title: "High Stability",
          description:
            "We use load balancing and redundant system design to ensure stable service delivery. Through continuous monitoring and automated maintenance, we can quickly identify and resolve potential issues, minimizing service interruptions and providing you with a reliable cloud computing service.",
        },
        {
          icon: "/gpu-instance/gpu-landingpage/service.svg",
          title: "Professional Service",
          description:
            "Need detailed configuration information, purchasing advice, or business consultations?  We offer 24/7 professional support to ensure your needs are met promptly, anytime.",
        },
      ],
    },
    contact: {
      title: "Contact Us",
      join: {
        title: "Join Our Community",
        description:
          "Join our Discord group to connect with other users and learn more about our services. Get real-time support, share your experiences, and stay updated with the latest news.",
      },
      getStarted: {
        title: "Get Started Now",
        description:
          "Experience our services now. Get started today and unlock powerful computing resources tailored to your needs.",
      },
    },
    gpuData: {
      "rtx-4090": {
        model: "RTX 4090",
        title:
          "Explore NVIDIA RTX 4090 Features & Specs | High-Performance GPU",
        description:
          "RTX 4090: Unleash superior performance & high-end gaming with NVIDIA's latest GPU. Discover specs, features, and more!",
        params: {
          model: {
            text: "NVIDIA GeForce RTX 4090",
          },
          gpuArch: {
            text: "Ada Lovelace",
          },
          vram: {
            text: "24 GB GDDR6X",
          },
          cudaCore: 16384,
          busWidth: {
            text: "384-bit",
          },
          memoryBandwidth: {
            text: "1.008 TB/s",
          },
          rtCore: {
            text: "Third generation 128",
          },
          tensorCore: {
            text: "Fourth generation 512",
          },
          boostClock: {
            text: "2.52 GHz",
          },
          computingPower: {
            text: "83 TFLOPs (TeraFLOPS)",
          },
        },
        performanceEval: {
          description:
            "RTX 4090 evaluation: Excellent performance on stable diffusion's WebUI and WebUI(xformer)",
          products: [
            {
              name: "RTX 3090",
              indicators: [
                {
                  name: "WebUI",
                  value: "15.92 it/s",
                },
                {
                  name: "WebUI(xformers)",
                  value: "26.07 it/s",
                },
              ],
            },
            {
              name: "RTX 4090",
              indicators: [
                {
                  name: "WebUI",
                  value: "19.90 it/s",
                },
                {
                  name: "WebUI(xformers)",
                  value: "36.14/s",
                },
              ],
            },
          ],
        },
      },
      a100: {
        model: "A100",
        title: "Introducing NVIDIA A100 GPU: Advanced AI & HPC Computing",
        description:
          "A100 by NVIDIA: Discover the next-generation GPU for AI and high-performance computing. Specs, architecture, and more detailed here.",
        params: {
          model: {
            text: "NVIDIA Tesla A100",
          },
          gpuArch: {
            text: "Ampere",
          },
          vram: {
            text: "80 GB HBM2",
          },
          cudaCore: 6912,
          busWidth: {
            text: "5120-bit (HBM2)",
          },
          memoryBandwidth: {
            text: "1.555 TB/s",
          },
          rtCore: {
            text: "Not applicable",
          },
          tensorCore: {
            text: "Third generation 432",
          },
          boostClock: {
            text: "1.41 GHz",
          },
          computingPower: {
            text: "19.5 TFLOPs ",
          },
        },
        performanceEval: {
          description:
            "A100 evaluation: Runs Llama3 smoothly with Batch Sizes of 1 and 30, showcasing robust performance",
          products: [
            {
              name: "RTX 4090",
              indicators: [
                {
                  name: "Batch Size =1",
                  value: "453.67 ms",
                },
                {
                  name: "Batch Size =30",
                  value: "19109.86 ms",
                },
              ],
            },
            {
              name: "A100",
              indicators: [
                {
                  name: "Batch Size =1",
                  value: "298.31 ms",
                },
                {
                  name: "Batch Size =30",
                  value: "4651.77 ms",
                },
              ],
            },
          ],
        },
      },
      l40: {
        model: "L40",
        title: "Discover NVIDIA L40 (48GB) GPU: Powerhouse for Professionals",
        description:
          "RTX 4090 power in the new NVIDIA L40 (48GB) GPU enhances professional workflows with advanced computing capabilities.",
        params: {
          model: {
            text: "NVIDIA L40",
          },
          gpuArch: {
            text: "Ada Lovelace",
          },
          vram: {
            text: "48GB GDDR6 with ECC",
          },
          cudaCore: 18176,
          busWidth: {
            text: "384-bit",
          },
          memoryBandwidth: {
            text: "864GB/s",
          },
          rtCore: {
            text: "Third Generation 142",
          },
          tensorCore: {
            text: "Fourth Generation 568",
          },
          boostClock: {
            text: "2.49 GHz",
          },
          computingPower: {
            text: "90.52 TFLOPS",
          },
        },
        performanceEval: {
          description:
            "L40 evaluation: Tested on Llama3, performs solidly with Batch Sizes 1 and 30.",
          products: [
            {
              name: "RTX 4090",
              indicators: [
                {
                  name: "Batch Size =1",
                  value: "453.67 ms",
                },
                {
                  name: "Batch Size =30",
                  value: "19109.86 ms",
                },
              ],
            },
            {
              name: "L40",
              indicators: [
                {
                  name: "Batch Size =1",
                  value: "395.57 ms",
                },
                {
                  name: "Batch Size =30",
                  value: "14010.91 ms",
                },
              ],
            },
          ],
        },
      },
      "rtx-4070-super": {
        model: "RTX 4070 Super",
        title: "Unleash Gaming Power with the New RTX 4070 Super GPU",
        description:
          "Discover the superior performance and cutting-edge technology of the RTX 4070 Supe. Experience unparalleled gaming today!",
        params: {
          model: {
            text: "NVIDIA Geforce RTX 4070 Super",
          },
          gpuArch: {
            text: "Ampere ",
          },
          vram: {
            text: "10GB GDDR6X",
          },
          cudaCore: 5888,
          busWidth: {
            text: "320 Bit",
          },
          memoryBandwidth: {
            text: "760 GB/s",
          },
          rtCore: {
            text: "Second Generation 46 ",
          },
          tensorCore: {
            text: "Third Generation 184 ",
          },
          boostClock: {
            text: "1.71 GHz",
          },
          computingPower: {
            text: "20 TFLOPs",
          },
        },
        performanceEval: {
          description:
            "Experience exceptional gameplay with RTX 4070 Super, outperforming RTX 4070 in Red Dead Redemption 2 at both 1440p and 4K Epic presets.",
          products: [
            {
              name: "RTX 4070",
              indicators: [
                {
                  name: "1440p Epic Preset",
                  value: "110-120",
                },
                {
                  name: "4K Epic Preset",
                  value: "75-80",
                },
              ],
            },
            {
              name: "RTX 4070 Super",
              indicators: [
                {
                  name: "1440p Epic Preset",
                  value: "120-130",
                },
                {
                  name: "4K Epic Preset",
                  value: "90-95",
                },
              ],
            },
          ],
        },
      },
      "rtx-3090": {
        model: "RTX 3090",
        title: "Experience Unmatched Performance with the NVIDIA RTX 3090 GPU",
        description:
          "Unleash the power of NVIDIA's ultimate GPU—RTX 3090. Get unparalleled performance for gaming, rendering, and AI applications.",
        params: {
          model: {
            text: "NVIDIA GeForce RTX 3090",
          },
          gpuArch: {
            text: "Ampere",
          },
          vram: {
            text: "24GB GDDR6X",
          },
          cudaCore: 10496,
          busWidth: {
            text: "384 Bit",
          },
          memoryBandwidth: {
            text: "936.2 GB/s",
          },
          rtCore: {
            text: "Second Generation 82 ",
          },
          tensorCore: {
            text: "Third Generation 328 ",
          },
          boostClock: {
            text: "1.70 GHz",
          },
          computingPower: {
            text: "35.58 TFLOPs",
          },
        },
        performanceEval: {
          description:
            "Enjoy outstanding gaming performance with the RTX 3090, surpassing the RTX 3070 in Red Dead Redemption 2 at both 1440p and 4K Epic settings.",
          products: [
            {
              name: "RTX 3060",
              indicators: [
                {
                  name: "1440p Epic Preset",
                  value: "75-80",
                },
                {
                  name: "4K Epic Preset",
                  value: "40-45",
                },
              ],
            },
            {
              name: "RTX 3090",
              indicators: [
                {
                  name: "1440p Epic Preset",
                  value: 127,
                },
                {
                  name: "4K Epic Preset",
                  value: 110,
                },
              ],
            },
          ],
        },
      },
      a6000: {
        model: "A6000",
        title: "Boost Workflow with the NVIDIA RTX A6000",
        description:
          "Discover how the NVIDIA RTX A6000 enhances productivity and streamlines workflows for professionals in design, and content creation.",
        params: {
          model: {
            text: "NVIDIA RTX A6000",
          },
          gpuArch: {
            text: "Ampere",
          },
          vram: {
            text: "48GB GDDR6",
          },
          cudaCore: 8.6,
          busWidth: {
            text: "384 bit",
          },
          memoryBandwidth: {
            text: "768.0 GB/s",
          },
          rtCore: {
            text: "Second Generation 84",
          },
          tensorCore: {
            text: "Third Generation 336",
          },
          boostClock: {
            text: "1.80 GHz",
          },
          computingPower: {
            text: "38.71 TFLOPs",
          },
        },
        performanceEval: {
          description:
            "A6000 evaluation:offering unparalleled performance for AI, deep learning, and graphics workloads.",
          products: [
            {
              name: "RTX 6000 Ada",
              indicators: [
                {
                  name: "3dsmax-07",
                  value: 208.75,
                },
                {
                  name: "Maya-06",
                  value: 529.54,
                },
              ],
            },
            {
              name: " RTX A6000",
              indicators: [
                {
                  name: "3dsmax-07",
                  value: 137.15,
                },
                {
                  name: "Maya-06",
                  value: 341.36,
                },
              ],
            },
          ],
        },
      },
      v100: {
        model: "v100",
        title: "NVIDIA TeslaV100: High-Performance Computing",
        description:
          "Uncover how  NVIDIA Tesla V100 delivering exceptional performance for high-performance computing.",
        params: {
          model: {
            text: "NVIDIA Tesla V100",
          },
          gpuArch: {
            text: "Volta",
          },
          vram: {
            text: "32GB HBM2",
          },
          cudaCore: 5120,
          busWidth: {
            text: "4096 Bit",
          },
          memoryBandwidth: {
            text: "900.1 GB/s",
          },
          rtCore: {
            text: "Not applicable",
          },
          tensorCore: {
            text: 640,
          },
          boostClock: {
            text: "1.38 GHz",
          },
          computingPower: {
            text: "Single Precision (FP32): 15.7 TFLOPS\nDouble Precision (FP64): 7.8 TFLOPS\nTensor Performance (FP16): 125 TFLOPS",
          },
        },
      },
      "nvidia-geforce-gtx-1050-mobile-2gb": {
        model: "nvidia geforce gtx 1050 mobile 2gb",
        title: "GeForce GTX 1050 Mobile: The best mobile graphics chip",
        description:
          "Discover the power of GeForce GTX 1050 Mobile, delivering exceptional performance for gaming and graphics in a compact design. ",
        params: {
          model: {
            text: "NVIDIA GeForce GTX 1050 Mobile",
          },
          gpuArch: {
            text: "Pascal",
          },
          vram: {
            text: "2GB GDDR5",
          },
          cudaCore: 640,
          busWidth: {
            text: "128 Bit",
          },
          memoryBandwidth: {
            text: "112.1 GB/s",
          },
          rtCore: {
            text: "Not applicable",
          },
          tensorCore: {
            text: "Not applicable",
          },
          boostClock: {
            text: "1.49 GHz",
          },
          computingPower: {
            text: "1.911 TFLOPS",
          },
        },
        performanceEval: {
          description: "Enjoy exceptional gameplay with RTX 1050",
          products: [
            {
              name: "GTX 1050 ",
              indicators: [
                {
                  name: "1440p Epic Preset",
                  value: "21-24",
                },
                {
                  name: "4K Epic Preset",
                  value: "12--14",
                },
              ],
            },
            {
              name: "GTX 1050 Mobile",
              indicators: [
                {
                  name: "1440p Epic Preset",
                  value: "18-20",
                },
                {
                  name: "4K Epic Preset",
                  value: "10--11",
                },
              ],
            },
          ],
        },
      },
      "rtx-3070": {
        model: "RTX 3070",
        title: "Enjoy Unmatched Performance with NVIDIA GeForce RTX 3070",
        description:
          "Discover the power of NVIDIA GeForce RTX 3070 for gaming and creative tasks. Experience stunning graphics and unmatched performance. Upgrade your setup today!",
        params: {
          model: {
            text: "NVIDIA GeForce RTX 3070",
          },
          gpuArch: {
            text: "Ampere",
          },
          vram: {
            text: "8 GB GDDR6",
          },
          cudaCore: 5888,
          busWidth: {
            text: "256-bit",
          },
          memoryBandwidth: {
            text: "448.0 GB/s",
          },
          rtCore: {
            text: "Second generation 46",
          },
          tensorCore: {
            text: "Third generation 184",
          },
          boostClock: {
            text: "1.73 GHz",
          },
          computingPower: {
            text: "20.31 TFLOPS",
          },
        },
        performanceEval: {
          description:
            "Enjoy outstanding gaming performance with the RTX 3070, making a comparison between RTX 4090 and RTX 3070",
          products: [
            {
              name: "RTX 4090",
              indicators: [
                {
                  name: "1440p Epic Preset (Battlefield 5)",
                  value: "160-170",
                },
                {
                  name: "1440p Epic Preset (Far Cry New Dawn)",
                  value: "110-120",
                },
              ],
            },
            {
              name: "RTX 3070",
              indicators: [
                {
                  name: "1440p Epic Preset (Battlefield 5)",
                  value: "120-130",
                },
                {
                  name: "1440p Epic Preset (Far Cry New Dawn)",
                  value: "90-95",
                },
              ],
            },
          ],
        },
      },
      "nvidia-geforce-gtx-1080-max-q": {
        model: "nvidia geforce gtx 1080 max-q",
        title:
          "Experience NVIDIA mobile graphics chip with geforce gtx 1080 max-q",
        description: "",
        params: {
          model: {
            text: "GeForce GTX 1080 Max-Q",
          },
          gpuArch: {
            text: "Pascal",
          },
          vram: {
            text: "8 GB GDDR5X",
          },
          cudaCore: 6.1,
          busWidth: {
            text: "",
          },
          memoryBandwidth: {
            text: "320.3 GB/s",
          },
          rtCore: {
            text: "",
          },
          tensorCore: {
            text: "",
          },
          boostClock: {
            text: "1.366 GHz",
          },
          computingPower: {
            text: "6.994 TFLOPS",
          },
        },
      },
    },
  };
}
