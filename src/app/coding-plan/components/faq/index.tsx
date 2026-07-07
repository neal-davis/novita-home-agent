"use client";

import { faqList } from "./faqList";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="max_width_container py-[80px]">
      <div className="mx-web">
        <h3 className="font-h3 text-[var(--dark-1)] text-center mb-4">
          {"Frequently Asked Questions"}
        </h3>
        <h3 className="font-p text-[var(--dark-2)] text-center mb-[48px]">
          {"Everything you need to know about Novita Coding"}
        </h3>
        <div className="flex flex-col gap-6">
          {faqList.map((item: any, index: number) => {
            return (
              <div key={index} className="group border-[1px] border-[var(--gray-2)] bg-white rounded-[4px]">
                <div className={`py-5 px-6 flex justify-between items-center rounded-t-[4px] cursor-pointer
                  ${openIndex === index ? "border-b-[1px] border-b-[var(--gray-2)]" : "border-none rounded-b-[4px]"}
                  bg-[var(--gray-3)] gap-2`}
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
                  <div className="font-h5 text-[var(--dark-2)]">
                    {item.question}
                  </div>
                  <span className={`cursor-pointer ${openIndex === index ? "text-[var(--brand-1)]" : ""}
                    group-hover:text-[var(--brand-1)] group-hover:opacity-80`}>
                    <ChevronDown className={`w-4 h-4 transition-transform 
                      duration-300 ${openIndex === index ? "rotate-180" : ""}`} />
                  </span>
                </div>
                {openIndex === index && <div className="p-6 font-subtle text-[var(--dark-2)]">
                  {item.answer}
                </div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>)
}