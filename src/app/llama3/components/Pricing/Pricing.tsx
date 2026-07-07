import * as React from "react";
import { PricingCard } from "./PricingCard";
function createCopyPriceCompares() {
  return [
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
  ];
}
export default function PricingComparison({ copy }: { copy?: unknown }) {
  return (
    <main className="flex flex-col justify-center items-center py-[90px] bg-common-gray-3">
      <section className="flex flex-col justify-center w-full max_width_container">
        <h2 className="text-4xl font-bold leading-tight text-center text-slate-900 max-md:max-w-full">
          {"Compare Our Pricing with Others"}
        </h2>
        <div className="flex flex-wrap flex-col lg:flex-row gap-5 items-stretch self-center mt-8 w-full">
          {createCopyPriceCompares()
            .slice(0, 2)
            .map((card, index) => (
              <PricingCard key={index} {...card} />
            ))}
        </div>
        <div className="flex flex-wrap flex-col lg:flex-row gap-5 items-stretch self-center mt-5 w-full">
          {createCopyPriceCompares()
            .slice(2, 4)
            .map((card, index) => (
              <PricingCard key={index} {...card} />
            ))}
        </div>
        <div className="flex flex-wrap flex-col lg:flex-row gap-5 items-stretch self-center mt-5 w-full">
          {createCopyPriceCompares()
            .slice(4)
            .map((card, index) => (
              <PricingCard key={index} {...card} />
            ))}
        </div>
      </section>
    </main>
  );
}
