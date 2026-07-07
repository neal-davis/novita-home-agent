import Footer from "@/app/components/footer/Footer";
import Header from "@/app/components/header/Header";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import Head from "./components/Head/Head";
import Features from "./components/Features";
import PricingComparison from "./components/Pricing/Pricing";
import Integration from "./components/Integration/Integration";
import Plan from "./components/Plan/Plan";
function createLlama3Copy() {
  return {
    title: "Save Up to 70% with Llama 3 API",
    desc: "Unmatched performance and reliability at an unbeatable cost.",
    book: "Book a Call",
    try: "Try Our Playground",
    features: {
      title: "Key Features of Llama 3 API",
      items: [
        {
          title: "Simple & Easy to Use",
          desc: "Fast integration with minimal configuration.",
        },
        {
          title: "Affordable",
          desc: "Save up to 70% compared to other LLM API providers.",
        },
        {
          title: "Reliable & Scalable",
          desc: "Built on a high-performance, stable platform that scales with your needs.",
        },
        {
          title: "OpenAI Compatible",
          desc: "Easy integration into your existing application using OpenAI API standards.",
        },
      ],
    },
    price: {
      title: "Compare Our Pricing with Others",
      other: "Other Providers",
      our: "Our Price",
      try: "Try Now",
      compares: [
        {
          model: "Llama-3.1-8B-Instruct",
          other: "$0.20/M tokens (Input/Output)",
          our: "$0.05/M tokens (Input/Output)",
          save: "Save 75%!",
        },
        {
          model: "Llama-3.1-70B-Instruct",
          other: "$0.90/M token (Input/Output)",
          our: "$0.34/M tokens (Input), $0.39/M tokens (Output)",
          save: "Save 60%!",
        },
        {
          model: "Llama-3-8B-Instruct",
          other: "$0.20/M tokens (Input/Output)",
          our: "$0.04/M tokens (Input/Output)",
          save: "Save 80%!",
        },
        {
          model: "Llama-3-70B-Instruct",
          other: "$0.90/M tokens (Input/Output)",
          our: "$0.51/M tokens (Input), $0.74/M tokens (Output)",
          save: "Input Save 43%!",
        },
        {
          model: "Llama-3.2-3B-Instruct",
          other: "$0.10/M tokens (Input/Output)",
          our: "$0.03/M tokens (Input), $0.05/M tokens (Output)",
          save: "Save 60%!",
        },
        {
          model: "Llama-3.2-11B-Vision-Instruct",
          other: "$0.20/M tokens (Input/Output)",
          our: "$0.06/M tokens (Input/Output)",
          save: "Save 70%!",
        },
      ],
    },
    integrate: {
      title: "Integrate Llama 3 API with Your Application",
      desc: "We provide compatibility with the OpenAI API standard, allowing for easier integration into your existing applications.",
      baseURL: "API Base URL",
      url: "https://api.novita.ai/openai",
      models: "Supported Models",
      check:
        "Check the full list of supported models here or use the Models API to get all available models.",
      key: "Get API Key",
    },
    plan: {
      title: "Choose a pricing plan that suits you",
    },
    comments: {
      title: "What Our Customers Are Saying",
    },
    contact: {
      title: "Contact Us for More Information",
      subTitle:
        "Have any questions or need assistance? Reach out to our team today!",
      book: "Book a Call",
    },
  };
}
export const metadata = {
  title: "Llama 3 API: Save 70% on Powerful LLM Performance",
  description:
    "Free Try Llama 3 API demo: Simple to use, save up to 70% on calls vs. other LLM API providers! Enjoy reliable, scalable performance and OpenAI compatibility.",
};
export default function EndOfServicePage() {
  return (
    <main className="relative max-w-full overflow-hidden">
      <Header />
      <Head copy={createLlama3Copy()} />
      <Features copy={createLlama3Copy()} />
      <PricingComparison copy={createLlama3Copy()} />
      <Integration copy={createLlama3Copy()} />
      <Plan copy={createLlama3Copy()} />
      <FooterBanner />
      <Footer />
    </main>
  );
}
