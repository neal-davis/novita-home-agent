import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",

    // Path to Tremor module
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "390px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1340px",
      "2xl": "1700px",
    },
    extend: {
      zIndex: {
        "999": "999",
        "1000": "1000",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // ---------- Primitive Color Scales ----------
        brand: {
          0: "var(--brand-0, #23d57c)",
          1: "var(--brand-1, #16b063)",
          2: "var(--brand-2, #caf6e0)",
          3: "var(--brand-3, #effcf5)",
        },
        gray: {
          50: "var(--gray-50, #fafafa)",
          100: "var(--gray-100, #f5f5f5)",
          200: "var(--gray-200, #e5e5e5)",
          300: "var(--gray-300, #d4d4d4)",
          400: "var(--gray-400, #a1a1a1)",
          500: "var(--gray-500, #737373)",
          600: "var(--gray-600, #525252)",
          700: "var(--gray-700, #404040)",
          800: "var(--gray-800, #262626)",
          900: "var(--gray-900, #171717)",
          950: "var(--gray-950, #0a0a0a)",
        },
        blue: {
          100: "var(--blue-100, #d0f0fd)",
          200: "var(--blue-200, #89dfff)",
          400: "var(--blue-400, #18bfff)",
          500: "var(--blue-500, #01a9db)",
          600: "var(--blue-600, #0096c7)",
          700: "var(--blue-700, #007ea4)",
        },
        green: {
          50: "var(--green-50, #f4fff8)",
          100: "var(--green-100, #e2ffed)",
          200: "var(--green-200, #b7ffd5)",
          400: "var(--green-400, #72efa6)",
          500: "var(--green-500, #2cd673)",
          600: "var(--green-600, #22ad5c)",
          700: "var(--green-700, #1a8245)",
          DEFAULT: "var(--brand-0)",
          foreground: "var(--dark-1)",
          hover: "var(--brand-1)",
        },
        orange: {
          50: "var(--orange-50, #fff0e9)",
          100: "var(--orange-100, #fde5d8)",
          200: "var(--orange-200, #fbd5c0)",
          400: "var(--orange-400, #f8b490)",
          500: "var(--orange-500, #f59460)",
          600: "var(--orange-600, #f27430)",
          700: "var(--orange-700, #e1580e)",
        },
        red: {
          50: "var(--red-50, #fef3f3)",
          100: "var(--red-100, #feebeb)",
          200: "var(--red-200, #fbc0c0)",
          400: "var(--red-400, #f89090)",
          500: "var(--red-500, #f56060)",
          600: "var(--red-600, #f23030)",
          700: "var(--red-700, #e10e0e)",
        },
        yellow: {
          50: "var(--yellow-50, #fffbeb)",
          100: "var(--yellow-100, #fef3c7)",
          200: "var(--yellow-200, #fde68a)",
          300: "var(--yellow-300, #fcd34d)",
          400: "var(--yellow-400, #fbbf24)",
          500: "var(--yellow-500, #f59e0b)",
          600: "var(--yellow-600, #d97706)",
        },
        purple: {
          50: "var(--purple-50, #f4f1ff)",
          100: "var(--purple-100, #ede9fe)",
          200: "var(--purple-200, #c4b5fd)",
          400: "var(--purple-400, #a78bfa)",
          500: "var(--purple-500, #8c54f4)",
          600: "var(--purple-600, #6d28d9)",
          700: "var(--purple-700, #5b21b6)",
        },
        cyan: {
          100: "var(--blue-100, #d0f0fd)",
          200: "var(--blue-200, #89dfff)",
          400: "var(--blue-400, #18bfff)",
          500: "var(--blue-500, #01a9db)",
        },

        // ---------- Semantic Colors ----------
        text: {
          1: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
          4: "var(--text-4)",
          brand: "var(--text-brand)",
          link: "var(--text-link)",
          success: "var(--text-success)",
          warning: "var(--text-warning)",
          error: "var(--text-error)",
        },
        fill: {
          1: "var(--fill-1)",
          2: "var(--fill-2)",
          3: "var(--fill-3)",
          4: "var(--fill-4)",
          5: "var(--fill-5)",
          white: "var(--fill-white)",
        },
        "border-color": {
          1: "var(--border-1)",
          2: "var(--border-2)",
          3: "var(--border-3)",
          4: "var(--border-4)",
          brand: "var(--border-brand)",
          success: "var(--border-success)",
          warning: "var(--border-warning)",
          error: "var(--border-error)",
          subtle: "var(--border-subtle)",
          default: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        bg: {
          default: "var(--bg-default)",
          light: "var(--bg-light)",
          inverse: "var(--bg-inverse)",
        },
        overlay: {
          hover: "var(--overlay-hover)",
          "hover-strong": "var(--overlay-hover-strong)",
          pressed: "var(--overlay-pressed)",
          disabled: "var(--overlay-disabled)",
          "mask-light": "var(--overlay-mask-light)",
          mask: "var(--overlay-mask)",
          "mask-dark": "var(--overlay-mask-dark)",
        },
        status: {
          success: "var(--status-success)",
          "success-bg": "var(--status-success-bg)",
          warning: "var(--status-warning)",
          "warning-bg": "var(--status-warning-bg)",
          error: "var(--status-error)",
          "error-bg": "var(--status-error-bg)",
          info: "var(--status-info)",
          "info-bg": "var(--status-info-bg)",
          neutral: "var(--status-neutral)",
          "neutral-bg": "var(--status-neutral-bg)",
        },
        element: {
          "high-em": "var(--element-high-em)",
          "mid-em": "var(--element-mid-em)",
          "low-em": "var(--element-low-em)",
          disabled: "var(--element-disabled)",
          inverse: "var(--element-inverse)",
        },

        // ---------- Tremor ----------
        tremor: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        "dark-tremor": {
          brand: {
            faint: "#0B1229",
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          background: {
            muted: "#131A2B",
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },

        // ---------- Component / Shadcn ----------
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--bg-default)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--brand-0)",
          foreground: "var(--dark-1)",
          hover: "var(--brand-2)",
          disabled: "var(--gray-1)",
        },
        secondary: {
          DEFAULT: "var(--dark-1)",
          foreground: "var(--white)",
          hover: "var(--dark-2)",
        },
        tertiary: {
          DEFAULT: "var(--gray-3)",
          foreground: "var(--dark-1)",
          hover: "var(--gray-3)",
        },
        destructive: {
          DEFAULT: "var(--red-2)",
          foreground: "var(--white)",
          hover: "var(--red-3)",
        },
        warn: {
          DEFAULT: "var(--red-2)",
          foreground: "var(--white)",
          hover: "var(--red-3)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          light: "var(--gray-3)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--gray-2)",
          foreground: "var(--dark-1)",
          hover: "var(--fill-3)",
          active: "var(--gray-3)",
        },
        groupbtn: {
          DEFAULT: "var(--gray-1)",
          foreground: "var(--dark-3)",
          hover: "var(--dark-3)",
        },
        border: {
          DEFAULT: "var(--border)",
          "dark-1": "var(--dark-1)",
          "dark-2": "var(--dark-2)",
          "dark-3": "var(--dark-3)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        input: {
          DEFAULT: "var(--input)",
          hover: "var(--dark-1)",
        },
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        calendar: {
          outside: "var(--brand-0)",
          rangeBg: "var(--gray-3)",
        },

        // ---------- Deprecated (backwards compat) ----------
        dark: {
          1: "var(--dark-1, #292827)",
          2: "var(--dark-2, #4f4e4a)",
          3: "var(--dark-3, #9e9c98)",
          "3-1": "var(--dark-3-1, #6f6e6b)",
          4: "var(--dark-4, #bbb9b6)",
        },
        "common-dark": {
          1: "var(--dark-1)",
          2: "var(--dark-2)",
          3: "var(--dark-3)",
          4: "var(--dark-4)",
        },
        "common-gray": {
          1: "var(--gray-1)",
          2: "var(--gray-2)",
          3: "var(--gray-3)",
        },
      },

      // ---------- Font Size (design-token typography) ----------
      fontSize: {
        // Display
        "display-lg": [
          "var(--display-lg-font-size)",
          {
            lineHeight: "var(--display-lg-line-height)",
            fontWeight: "var(--display-lg-font-weight)",
            letterSpacing: "var(--display-lg-letter-spacing)",
          },
        ],
        "display-md": [
          "var(--display-md-font-size)",
          {
            lineHeight: "var(--display-md-line-height)",
            fontWeight: "var(--display-md-font-weight)",
            letterSpacing: "var(--display-md-letter-spacing)",
          },
        ],
        "display-sm": [
          "var(--display-sm-font-size)",
          {
            lineHeight: "var(--display-sm-line-height)",
            fontWeight: "var(--display-sm-font-weight)",
            letterSpacing: "var(--display-sm-letter-spacing)",
          },
        ],
        // Heading
        "heading-h1": [
          "var(--heading-h1-font-size)",
          {
            lineHeight: "var(--heading-h1-line-height)",
            fontWeight: "var(--heading-h1-font-weight)",
            letterSpacing: "var(--heading-h1-letter-spacing)",
          },
        ],
        "heading-h2": [
          "var(--heading-h2-font-size)",
          {
            lineHeight: "var(--heading-h2-line-height)",
            fontWeight: "var(--heading-h2-font-weight)",
            letterSpacing: "var(--heading-h2-letter-spacing)",
          },
        ],
        "heading-h3": [
          "var(--heading-h3-font-size)",
          {
            lineHeight: "var(--heading-h3-line-height)",
            fontWeight: "var(--heading-h3-font-weight)",
            letterSpacing: "var(--heading-h3-letter-spacing)",
          },
        ],
        "heading-h4": [
          "var(--heading-h4-font-size)",
          {
            lineHeight: "var(--heading-h4-line-height)",
            fontWeight: "var(--heading-h4-font-weight)",
            letterSpacing: "var(--heading-h4-letter-spacing)",
          },
        ],
        "heading-h5": [
          "var(--heading-h5-font-size)",
          {
            lineHeight: "var(--heading-h5-line-height)",
            fontWeight: "var(--heading-h5-font-weight)",
            letterSpacing: "var(--heading-h5-letter-spacing)",
          },
        ],
        // Paragraph
        "paragraph-20": [
          "var(--paragraph-20-font-size)",
          { lineHeight: "var(--paragraph-20-line-height)" },
        ],
        "paragraph-18": [
          "var(--paragraph-18-font-size)",
          { lineHeight: "var(--paragraph-18-line-height)" },
        ],
        "paragraph-16": [
          "var(--paragraph-16-font-size)",
          { lineHeight: "var(--paragraph-16-line-height)" },
        ],
        "paragraph-15": [
          "var(--paragraph-15-font-size)",
          { lineHeight: "var(--paragraph-15-line-height)" },
        ],
        "paragraph-14": [
          "var(--paragraph-14-font-size)",
          { lineHeight: "var(--paragraph-14-line-height)" },
        ],
        "paragraph-13": [
          "var(--paragraph-13-font-size)",
          { lineHeight: "var(--paragraph-13-line-height)" },
        ],
        "paragraph-12": [
          "var(--paragraph-12-font-size)",
          { lineHeight: "var(--paragraph-12-line-height)" },
        ],
        // Mono
        "mono-14": [
          "var(--mono-14-font-size)",
          { lineHeight: "var(--mono-14-line-height)" },
        ],
        "mono-13": [
          "var(--mono-13-font-size)",
          { lineHeight: "var(--mono-13-line-height)" },
        ],
        "mono-12": [
          "var(--mono-12-font-size)",
          { lineHeight: "var(--mono-12-line-height)" },
        ],
        // Tremor
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },

      // ---------- Letter Spacing ----------
      letterSpacing: {
        "display-lg": "var(--display-lg-letter-spacing)",
        "display-md": "var(--display-md-letter-spacing)",
        "display-sm": "var(--display-sm-letter-spacing)",
        "heading-h1": "var(--heading-h1-letter-spacing)",
        "heading-h2": "var(--heading-h2-letter-spacing)",
        "heading-h3": "var(--heading-h3-letter-spacing)",
        "heading-h4": "var(--heading-h4-letter-spacing)",
        "heading-h5": "var(--heading-h5-letter-spacing)",
      },

      // ---------- Border Radius ----------
      borderRadius: {
        // New design tokens
        0: "var(--radius-0)",
        2: "var(--radius-2)",
        4: "var(--radius-4)",
        6: "var(--radius-6)",
        8: "var(--radius-8)",
        12: "var(--radius-12)",
        full: "var(--radius-full)",
        // Legacy aliases
        sm: "var(--radius-4-small)",
        regular: "var(--radius-6-regular)",
        medium: "var(--radius-8-medium)",
        large: "var(--radius-12-large)",
        round: "var(--radius-999-round)",
        button: "var(--radius-button)",
        input: "var(--radius-input)",
        form: "var(--radius-form)",
        dialog: "var(--radius-dialog)",
      },

      // ---------- Font Family ----------
      fontFamily: {
        miletus: "var(--font-miletus)",
        "tt-mono": "var(--font-tt-mono)",
        // Legacy alias
        "miletus-grotesk-trial": "var(--font-miletus)",
      },

      screens: {
        middle: { max: "900px" },
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
        4: "var(--shadow-4)",
        5: "var(--shadow-5)",
      },
      spacing: {
        // Design token spacing scale
        "space-0": "var(--space-0)",
        "space-2": "var(--space-2)",
        "space-4": "var(--space-4)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
        "space-10": "var(--space-10)",
        "space-12": "var(--space-12)",
        "space-16": "var(--space-16)",
        "space-20": "var(--space-20)",
        "space-24": "var(--space-24)",
        "space-26": "var(--space-26)",
        "space-32": "var(--space-32)",
        "space-40": "var(--space-40)",
        "space-48": "var(--space-48)",
        "space-80": "var(--space-80)",
        "space-120": "var(--space-120)",
      },
      height: {
        header: "var(--header-height)",
        "console-header": "var(--console-header-height)",
        notice: "var(--notice-height)",
      },
      minHeight: {
        header: "var(--header-height)",
        "console-header": "var(--console-header-height)",
      },
      padding: {
        web: "var(--spacing-layout-inner-x)",
        console: "var(--spacing-console-inner-x)",
      },
      margin: {
        web: "var(--spacing-layout-inner-x)",
        console: "var(--spacing-console-inner-x)",
      },
      maxWidth: {
        "layout-nav": "var(--layout-nav-max)",
        "layout-safe": "var(--layout-safe-max)",
        "layout-content": "var(--layout-content-max)",
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [require("@headlessui/tailwindcss"), require("tailwindcss-animate")],
};
export default config;
