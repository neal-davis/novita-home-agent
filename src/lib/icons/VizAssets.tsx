import React from "react";

interface SvgProps {
  className?: string;
  style?: React.CSSProperties;
}

// ── Bracket (same path for both sides; flip right side with CSS rotate/scale) ─

export function VizBracket({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 4.3418 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        d="M3.8418 0.5C3.07693 0.5 2.46823 0.5 1.98576 0.5C0.881195 0.5 0.5 1.39543 0.5 2.5V21.5C0.5 22.6046 1.39543 23.5 2.5 23.5H3.8418"
        stroke="black"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Background blobs ──────────────────────────────────────────────────────────

export function VizBgLlm({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 518.855 704.182"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        opacity="0.4"
        d="M319.265 296.821L202.584 0L28.33 55.27V622.811L319.265 296.821Z"
        fill="url(#paint0_radial_llm)"
      />
      <g filter="url(#filter0_f_llm)">
        <path
          d="M168.185 618.718L321.312 296.821C232.577 408.891 155.447 477.097 66.712 589.167V618.718H168.185Z"
          stroke="url(#paint1_linear_llm)"
          strokeWidth="36"
        />
      </g>
      <g opacity="0.4" filter="url(#filter1_f_llm)">
        <path
          d="M455.393 358.23L318.242 294.772L168.552 618.716L419.57 640.721L455.393 358.23Z"
          fill="url(#paint2_radial_llm)"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_llm"
          x="0"
          y="236.935"
          width="386.279"
          height="448.494"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur stdDeviation="24.356" result="effect1_llm" />
        </filter>
        <filter
          id="filter1_f_llm"
          x="105.091"
          y="231.311"
          width="413.764"
          height="472.872"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur stdDeviation="31.7306" result="effect2_llm" />
        </filter>
        <radialGradient
          id="paint0_radial_llm"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(390.364 -536.262 -111.718 -494.847 59.8515 453.919)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.156131" stopColor="#FCFCFD" />
          <stop offset="0.611346" stopColor="#C3BEBC" />
          <stop offset="1" stopColor="#BCA7A1" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_llm"
          x1="340.048"
          y1="488.417"
          x2="66.712"
          y2="488.417"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D8FFB9" />
          <stop offset="0.466346" stopColor="white" />
          <stop offset="1" stopColor="#FFFA8B" />
        </linearGradient>
        <radialGradient
          id="paint2_radial_llm"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(288.721 876.019 -171.161 107.473 332.46 362.836)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9F1D8" />
          <stop offset="1" stopColor="#C0B6B3" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function VizBgOther({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 1245.46 1724.07"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        opacity="0.4"
        d="M803.053 746.597L509.563 0L71.2589 139.022V1566.57L803.053 746.597Z"
        fill="url(#paint0_radial_other)"
      />
      <g filter="url(#filter0_f_other)">
        <path
          d="M423.039 1556.27L808.202 746.598C585.005 1028.49 390.999 1200.05 167.802 1481.94V1556.27H423.039Z"
          stroke="url(#paint1_linear_other)"
          strokeWidth="90.5514"
        />
      </g>
      <g opacity="0.4" filter="url(#filter1_f_other)">
        <path
          d="M1145.46 901.062L800.479 741.444L423.962 1556.27L1055.35 1611.62L1145.46 901.062Z"
          fill="url(#paint2_radial_other)"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_other"
          x="3.8147e-06"
          y="595.967"
          width="971.614"
          height="1128.11"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur stdDeviation="61.263" result="effect1_other" />
        </filter>
        <filter
          id="filter1_f_other"
          x="323.962"
          y="641.444"
          width="921.496"
          height="1070.17"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur stdDeviation="50" result="effect2_other" />
        </filter>
        <radialGradient
          id="paint0_radial_other"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(981.89 -1348.87 -281.006 -1244.7 150.545 1141.75)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.156131" stopColor="#FCFCFD" />
          <stop offset="0.611346" stopColor="#C3BEBC" />
          <stop offset="1" stopColor="#BCA7A1" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_other"
          x1="855.328"
          y1="1228.52"
          x2="167.802"
          y2="1228.52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D8FFB9" />
          <stop offset="0.466346" stopColor="white" />
          <stop offset="1" stopColor="#FFFA8B" />
        </linearGradient>
        <radialGradient
          id="paint2_radial_other"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(726.224 2203.46 -430.524 270.328 836.241 912.646)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9F1D8" />
          <stop offset="1" stopColor="#C0B6B3" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ── Connector lines (one per tag→MODEL connection, always rendered) ───────────
// Each uses the visible SVG variant with a correctly-sized viewBox.

/** LLM tag → MODEL (155px wide, curves left→right) */
export function VizConnector1({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 158.167 70.6667"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        d="M2 0.5C1.16667 0.5 0.5 1.16667 0.5 2C0.5 2.83333 1.16667 3.5 2 3.5C2.83333 3.5 3.5 2.83333 3.5 2C3.5 1.16667 2.83333 0.5 2 0.5Z"
        fill="white"
      />
      <path
        d="M152.833 68C152.833 69.4728 154.027 70.6667 155.5 70.6667C156.973 70.6667 158.167 69.4728 158.167 68C158.167 66.5272 156.973 65.3333 155.5 65.3333C154.027 65.3333 152.833 66.5272 152.833 68ZM0.5 2H1C1 1.44281 1.44281 1 2 1V0.5V0C0.890524 0 0 0.890524 0 2H0.5ZM2 0.5V1C2.55719 1 3 1.44281 3 2H3.5H4C4 0.890524 3.10948 0 2 0V0.5ZM3.5 2H3C3 2.55719 2.55719 3 2 3V3.5V4C3.10948 4 4 3.10948 4 2H3.5ZM2 3.5V3C1.44281 3 1 2.55719 1 2H0.5H0C0 3.10948 0.890524 4 2 4V3.5ZM2 3.5H1.5C1.5 11.8906 8.56089 18.0583 19.446 23.1021C30.3716 28.1646 45.3869 32.2058 61.7555 36.2355C78.1434 40.2699 95.9026 44.296 112.385 49.3298C128.871 54.3644 144.026 60.3924 155.209 68.4064L155.5 68L155.791 67.5936C144.474 59.4826 129.192 53.4168 112.677 48.3734C96.1599 43.329 78.3566 39.2926 61.9945 35.2645C45.6131 31.2317 30.6909 27.2104 19.8665 22.1948C9.00161 17.1604 2.5 11.2344 2.5 3.5H2Z"
        fill="black"
      />
    </svg>
  );
}

/** IMAGE tag → MODEL (106px wide) */
export function VizConnector2({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 109.167 70.6667"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        d="M2 0.5C1.16667 0.5 0.5 1.16667 0.5 2C0.5 2.83333 1.16667 3.5 2 3.5C2.83333 3.5 3.5 2.83333 3.5 2C3.5 1.16667 2.83333 0.5 2 0.5Z"
        fill="white"
      />
      <path
        d="M103.833 68C103.833 69.4728 105.027 70.6667 106.5 70.6667C107.973 70.6667 109.167 69.4728 109.167 68C109.167 66.5272 107.973 65.3333 106.5 65.3333C105.027 65.3333 103.833 66.5272 103.833 68ZM0.5 2H1C1 1.44281 1.44281 1 2 1V0.5V0C0.890524 0 0 0.890524 0 2H0.5ZM2 0.5V1C2.55719 1 3 1.44281 3 2H3.5H4C4 0.890524 3.10948 0 2 0V0.5ZM3.5 2H3C3 2.55719 2.55719 3 2 3V3.5V4C3.10948 4 4 3.10948 4 2H3.5ZM2 3.5V3C1.44281 3 1 2.55719 1 2H0.5H0C0 3.10948 0.890524 4 2 4V3.5ZM2 3.5H1.5C1.5 11.75 5.31871 17.9295 11.6871 23.0384C18.0333 28.1296 26.9413 32.1838 37.192 36.2153C57.7388 44.2962 83.7746 52.3286 106.209 68.4064L106.5 68L106.791 67.5936C84.2254 51.4214 58.0112 43.3288 37.558 35.2847C27.3087 31.2537 18.5292 27.2454 12.3129 22.2584C6.11879 17.2893 2.5 11.375 2.5 3.5H2Z"
        fill="black"
      />
    </svg>
  );
}

/** AUDIO tag → MODEL (49px wide) */
export function VizConnector3({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 52.1667 70.6667"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        d="M2 0.5C1.16667 0.5 0.5 1.16667 0.5 2C0.5 2.83333 1.16667 3.5 2 3.5C2.83333 3.5 3.5 2.83333 3.5 2C3.5 1.16667 2.83333 0.5 2 0.5Z"
        fill="white"
      />
      <path
        d="M46.8333 68C46.8333 69.4728 48.0272 70.6667 49.5 70.6667C50.9728 70.6667 52.1667 69.4728 52.1667 68C52.1667 66.5272 50.9728 65.3333 49.5 65.3333C48.0272 65.3333 46.8333 66.5272 46.8333 68ZM0.5 2H1C1 1.44281 1.44281 1 2 1V0.5V0C0.890524 0 0 0.890524 0 2H0.5ZM2 0.5V1C2.55719 1 3 1.44281 3 2H3.5H4C4 0.890524 3.10948 0 2 0V0.5ZM3.5 2H3C3 2.55719 2.55719 3 2 3V3.5V4C3.10948 4 4 3.10948 4 2H3.5ZM2 3.5V3C1.44281 3 1 2.55719 1 2H0.5H0C0 3.10948 0.890524 4 2 4V3.5ZM2 3.5H1.5C1.5 19.6117 2.11255 27.8425 8.47983 36.0563C11.6457 40.1404 16.2193 44.2034 22.7892 49.2481C29.3604 54.2938 37.9655 60.3487 49.2087 68.4064L49.5 68L49.7913 67.5936C38.5345 59.5263 29.9521 53.4874 23.3983 48.455C16.8432 43.4216 12.3543 39.4221 9.27017 35.4437C3.13745 27.5325 2.5 19.6383 2.5 3.5H2Z"
        fill="black"
      />
    </svg>
  );
}

/** VIDEO tag → MODEL (14.83px wide, nearly vertical) */
export function VizConnector4({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 14.8327 70.6667"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        d="M12.8327 0.5C11.9993 0.5 11.3327 1.16667 11.3327 2C11.3327 2.83333 11.9993 3.5 12.8327 3.5C13.666 3.5 14.3327 2.83333 14.3327 2C14.3327 1.16667 13.666 0.5 12.8327 0.5Z"
        fill="black"
      />
      <path
        d="M0 68C0 69.4728 1.19391 70.6667 2.66667 70.6667C4.13943 70.6667 5.33333 69.4728 5.33333 68C5.33333 66.5272 4.13943 65.3333 2.66667 65.3333C1.19391 65.3333 0 66.5272 0 68ZM11.3327 2H11.8327C11.8327 1.44281 12.2755 1 12.8327 1V0.5V0C11.7232 0 10.8327 0.890524 10.8327 2H11.3327ZM12.8327 0.5V1C13.3899 1 13.8327 1.44281 13.8327 2H14.3327H14.8327C14.8327 0.890524 13.9422 0 12.8327 0V0.5ZM14.3327 2H13.8327C13.8327 2.55719 13.3899 3 12.8327 3V3.5V4C13.9422 4 14.8327 3.10948 14.8327 2H14.3327ZM12.8327 3.5V3C12.2755 3 11.8327 2.55719 11.8327 2H11.3327H10.8327C10.8327 3.10948 11.7232 4 12.8327 4V3.5ZM12.8327 3.5H12.3327C12.3327 19.5641 10.1899 27.5779 7.85101 35.6102C5.49989 43.6844 2.94529 51.7917 2.16724 67.976L2.66667 68L3.16609 68.024C3.93843 51.9583 6.46683 43.9406 8.81113 35.8898C11.1676 27.7971 13.3327 19.6859 13.3327 3.5H12.8327Z"
        fill="black"
      />
    </svg>
  );
}

/** VISION tag → MODEL (67px wide, curves right→left) */
export function VizConnector5({ className, style }: SvgProps) {
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 67.1667 70.6667"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        d="M65.1667 0.5C64.3333 0.5 63.6667 1.16667 63.6667 2C63.6667 2.83333 64.3333 3.5 65.1667 3.5C66 3.5 66.6667 2.83333 66.6667 2C66.6667 1.16667 66 0.5 65.1667 0.5Z"
        fill="white"
      />
      <path
        d="M0 68C0 69.4728 1.19391 70.6667 2.66667 70.6667C4.13943 70.6667 5.33333 69.4728 5.33333 68C5.33333 66.5272 4.13943 65.3333 2.66667 65.3333C1.19391 65.3333 0 66.5272 0 68ZM63.6667 2H64.1667C64.1667 1.44281 64.6095 1 65.1667 1V0.5V0C64.0572 0 63.1667 0.890524 63.1667 2H63.6667ZM65.1667 0.5V1C65.7239 1 66.1667 1.44281 66.1667 2H66.6667H67.1667C67.1667 0.890524 66.2761 0 65.1667 0V0.5ZM66.6667 2H66.1667C66.1667 2.55719 65.7239 3 65.1667 3V3.5V4C66.2761 4 67.1667 3.10948 67.1667 2H66.6667ZM65.1667 3.5V3C64.6095 3 64.1667 2.55719 64.1667 2H63.6667H63.1667C63.1667 3.10948 64.0572 4 65.1667 4V3.5ZM65.1667 3.5H64.6667C64.6667 11.3762 60.9559 17.2964 55.2891 22.2727C49.6046 27.2646 41.9951 31.2688 34.2665 35.3068C26.5649 39.3308 18.7459 43.388 12.7627 48.4705C6.76413 53.566 2.5636 59.7314 2.16724 67.976L2.66667 68L3.16609 68.024C3.54493 60.1436 7.5445 54.2152 13.4101 49.2326C19.2909 44.237 27 40.2317 34.7296 36.1932C42.4322 32.1687 50.157 28.1104 55.949 23.0241C61.7587 17.9223 65.6667 11.7488 65.6667 3.5H65.1667Z"
        fill="black"
      />
    </svg>
  );
}

// ── GPU Cloud Serverless — JOB → pill 水平连线（语汇对齐 MODEL APIS `VizConnector*`） ─

/**
 * 水平直线 + 两端节点；圆与 viewBox 左右相切且不越界（避免 GPU 卡 `overflow-hidden` 裁切）。
 * 左：白心 + 描边；右：实心。中段为窄填充条；拉长请加大父级传入的 `width`，勿加大 `height`（none 会竖向拉粗）。
 */
export function GpuCloudJobConnector({ className, style }: SvgProps) {
  /**
   * 端点圆与 viewBox 左右相切；中段竖向厚度约 1.75（与旧 stroke 视觉接近）。
   * 仅通过使用处加大 `width` 拉长水平段；父组件勿用过大 `height`，`preserveAspectRatio=none` 会竖向拉伸变粗。
   */
  const r = 2.25;
  const cxL = r;
  const cxR = 100 - r;
  const barHalf = 1.75 / 2;
  const barY0 = 6 - barHalf;
  const barY1 = 6 + barHalf;
  const barX0 = cxL + r;
  const barX1 = cxR - r;
  return (
    <svg
      preserveAspectRatio="none"
      overflow="visible"
      viewBox="0 0 100 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: "block",
        color: "var(--element-high-em)",
        ...style,
      }}
      aria-hidden
    >
      <path
        d={`M ${barX0} ${barY0} L ${barX1} ${barY0} L ${barX1} ${barY1} L ${barX0} ${barY1} Z`}
        fill="currentColor"
      />
      <circle cx={cxL} cy="6" r="1.75" fill="white" />
      <circle
        cx={cxL}
        cy="6"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx={cxR} cy="6" r={r} fill="currentColor" />
    </svg>
  );
}

// ── MODEL type icon (custom "T" shape from Figma, used for LLM state) ─────────

export function VizIconLlm({ className, style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0H15V3.33333H13.75V1.25H8.125V13.75H10V15H5V13.75H6.875V1.25H1.25V3.33333H0V0Z"
        fill="black"
      />
    </svg>
  );
}
