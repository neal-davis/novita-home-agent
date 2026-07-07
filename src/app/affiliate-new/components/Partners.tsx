import LinkWithAuthority from "@/app/components/LinkWithAuthority";

// Partner integration guide links
const PARTNER_LINKS = [
  "https://novita.ai/docs/guides/huggingface",
  "https://novita.ai/docs/guides/integration-claude-code",
  "https://novita.ai/docs/guides/dify",
  "https://novita.ai/docs/guides/continue",
  "https://novita.ai/docs/guides/lobechat",
  "https://novita.ai/docs/guides/anythingllm",
  "https://novita.ai/docs/guides/langflow",
  "https://novita.ai/docs/guides/llamaindex",
];

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load
// time instead of re-evaluating per render.
function getPartnersInfo() {
  return [
    {
      desc: "Novita AI & Hugging Face Integration Guide",
      name: "Hugging Face",
    },
    {
      desc: "Claude Code Integration Guide",
      name: "Claude",
    },
    {
      desc: "Novita AI & Dify Integration Guide",
      name: "Dify",
    },

    {
      desc: "Novita AI & Continue Integration Guide",
      name: "Continue",
    },

    {
      desc: "Novita AI & LobeChat Integration Guide",
      name: "LobeChat",
    },

    {
      desc: "Novita AI & AnythingLLM Integration Guide",
      name: "AnythingLLM",
    },

    {
      desc: "Novita AI & Langflow Integration Guide",
      name: "Langflow",
    },

    {
      desc: "Novita AI & LlamaIndex Integration Guide",
      name: "LlamaIndex",
    },
  ];
}

export function Partners() {
  const PARTNERS_INFO = getPartnersInfo();
  return (
    <section className="py-20 pb-[40px] bg-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Triangle decorations */}
        {/* Top-left triangle */}
        <img
          src="/affiliate-new/top-left.png"
          alt=""
          className="absolute top-0 left-0 w-auto h-auto max-w-[400px] max-h-[400px] 2xl:max-w-none 2xl:max-h-none"
        />

        {/* Bottom-right triangle */}
        <img
          src="/affiliate-new/bottom-right.png"
          alt=""
          className="absolute bottom-0 right-0 w-auto h-auto max-w-[400px] max-h-[400px] 2xl:max-w-none 2xl:max-h-none"
        />
      </div>

      <div className="max_width_container relative z-10">
        <div className="mx-web">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-2 leading-[1em] tracking-[-2%]">
              Developer Ecosystem Partners
            </h2>
            <p className="text-base text-white max-w-[900px] mx-auto leading-[1.5] opacity-80">
              Novita AI provides seamless integration with popular open-source
              AI projects, enabling your audience to deploy professional-grade
              solutions instantly. Get enterprise performance with open source
              freedom.
            </p>
          </div>

          {/* Integration Cards Grid */}
          <div className="flex justify-center">
            <div className="w-full max-w-[1040px] space-y-1">
              {/* Row 1 - 4 cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">
                {/* Card 1 - Hugging Face */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-2xl xl:rounded-tr-none xl:rounded-bl-2xl xl:rounded-br-none 2xl:rounded-tl-2xl 2xl:rounded-tr-none 2xl:rounded-bl-2xl 2xl:rounded-br-none">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/huggingface.png"
                      alt="Hugging Face"
                      className="w-auto h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[0].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[0]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>

                {/* Card 2 - Claude */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-none xl:rounded-tr-none xl:rounded-bl-none xl:rounded-br-none 2xl:rounded-tl-none 2xl:rounded-tr-none 2xl:rounded-bl-none 2xl:rounded-br-none">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/Claude.png"
                      alt="Claude"
                      className="w-auto h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[1].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[1]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>

                {/* Card 3 - Dify */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-none xl:rounded-tr-none xl:rounded-bl-none xl:rounded-br-none 2xl:rounded-tl-none 2xl:rounded-tr-none 2xl:rounded-bl-none 2xl:rounded-br-none">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/Dify.png"
                      alt="Dify"
                      className="w-auto h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[2].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[2]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>

                {/* Card 4 - Continue */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-none xl:rounded-tr-2xl xl:rounded-bl-none xl:rounded-br-2xl 2xl:rounded-tl-none 2xl:rounded-tr-2xl 2xl:rounded-bl-none 2xl:rounded-br-2xl">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/Continue.png"
                      alt="Continue"
                      className="w-auto h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[3].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[3]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>
              </div>

              {/* Row 2 - 4 cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">
                {/* Card 5 - LobeChat */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-2xl xl:rounded-tr-none xl:rounded-bl-2xl xl:rounded-br-none 2xl:rounded-tl-2xl 2xl:rounded-tr-none 2xl:rounded-bl-2xl 2xl:rounded-br-none">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/LobeHub.png"
                      alt="LobeChat"
                      className="w-auto h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[4].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[4]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>

                {/* Card 6 - AnythingLLM */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-none xl:rounded-tr-none xl:rounded-bl-none xl:rounded-br-none 2xl:rounded-tl-none 2xl:rounded-tr-none 2xl:rounded-bl-none 2xl:rounded-br-none">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/anythingllm.png"
                      alt="AnythingLLM"
                      className="w-[108px] h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[5].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[5]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>

                {/* Card 7 - Langflow */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-none xl:rounded-tr-none xl:rounded-bl-none xl:rounded-br-none 2xl:rounded-tl-none 2xl:rounded-tr-none 2xl:rounded-bl-none 2xl:rounded-br-none">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/Langflow.png"
                      alt="Langflow"
                      className="w-auto h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[6].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[6]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>

                {/* Card 8 - LlamaIndex */}
                <div className="bg-[var(--dark-1)] p-6 min-h-[166px] flex flex-col rounded-2xl md:rounded-2xl xl:rounded-tl-none xl:rounded-tr-2xl xl:rounded-bl-none xl:rounded-br-2xl 2xl:rounded-tl-none 2xl:rounded-tr-2xl 2xl:rounded-bl-none 2xl:rounded-br-2xl">
                  <div className="flex items-center gap-1 mb-4">
                    <img
                      src="/affiliate-new/novita-logo.svg"
                      alt="Novita Logo"
                      className="w-[76px] h-[14px] object-contain"
                    />
                    <span className="text-xs font-subtle-medium text-[var(--dark-3)] tracking-[2%] uppercase">
                      X
                    </span>
                    <img
                      src="/affiliate-new/LlamaIndex.png"
                      alt="LlamaIndex"
                      className="w-auto h-[18px] object-contain rounded"
                    />
                  </div>
                  <p className="font-h6 text-white leading-[1.43] mb-3 flex-1">
                    {PARTNERS_INFO[7].desc}
                  </p>
                  <a
                    href={PARTNER_LINKS[7]}
                    className="text-sm text-[var(--brand-1)] leading-[1.43] hover:underline mt-auto"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Learn More Button */}
          <div className="text-center mt-8">
            <LinkWithAuthority
              href="https://novita.ai/docs/guides/model-apis-overview"
              className="inline-block bg-[var(--brand-1)] text-[var(--dark-1)] px-4 py-2 rounded font-mono text-base leading-[1.5] hover:bg-[var(--brand-2)] transition-colors"
            >
              learn more
            </LinkWithAuthority>
          </div>
        </div>
      </div>
    </section>
  );
}
