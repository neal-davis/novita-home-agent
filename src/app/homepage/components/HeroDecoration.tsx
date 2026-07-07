import type { CSSProperties } from "react";

interface AnchorRatio {
  xInContent: number;
  y: number;
}

interface Anchors {
  A: AnchorRatio;
  B: AnchorRatio;
  C: AnchorRatio;
}

// Anchor positions derived from Figma dot CENTERS on the 1512 x 983 design frame.
// Content safe area = 1440 max width with 48px side padding (so content spans
// x in [84, 1428] at design width, giving 1344px of usable content width).
const CONTENT_MAX_W = 1440;
const CONTENT_PAD_X = 48;
const DESIGN_H = 983;
const CONTENT_W = CONTENT_MAX_W - CONTENT_PAD_X * 2; // 1344
const CONTENT_LEFT = (1512 - CONTENT_MAX_W) / 2 + CONTENT_PAD_X; // 84

const ANCHOR_RATIOS: Anchors = {
  A: { xInContent: (965 - CONTENT_LEFT) / CONTENT_W, y: 214.26 / DESIGN_H },
  B: { xInContent: (819 - CONTENT_LEFT) / CONTENT_W, y: 363.79 / DESIGN_H },
  C: {
    xInContent: (1264.41 - CONTENT_LEFT) / CONTENT_W,
    y: 513.73 / DESIGN_H,
  },
};

const contentPlaneStyle = {
  left: `calc(max(0px, (100% - ${CONTENT_MAX_W}px) / 2) + ${CONTENT_PAD_X}px)`,
  width: `calc(min(100%, ${CONTENT_MAX_W}px) - ${CONTENT_PAD_X * 2}px)`,
} as const;

function pct(value: number) {
  return `${value * 100}%`;
}

function dotLeft(anchor: AnchorRatio, offsetPx: number) {
  return `calc(${pct(anchor.xInContent)} + ${offsetPx}px)`;
}

export default function HeroDecoration() {
  const { A, B, C } = ANCHOR_RATIOS;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] hidden lg:block"
      aria-hidden="true"
    >
      <svg
        className="absolute top-0 h-full"
        style={contentPlaneStyle}
        fill="none"
        overflow="visible"
      >
        <line
          className="hero-decoration-line"
          style={
            {
              "--line-delay": "520ms",
              "--line-duration": "1360ms",
            } as CSSProperties
          }
          pathLength={1}
          x1={pct(A.xInContent)}
          y1={pct(A.y)}
          x2={pct(C.xInContent)}
          y2={pct(C.y)}
          stroke="var(--alpha-dark-20)"
          strokeWidth="0.8"
          strokeDasharray={1}
          strokeDashoffset={1}
        />
        <line
          className="hero-decoration-line"
          style={
            {
              "--line-delay": "2240ms",
              "--line-duration": "1500ms",
            } as CSSProperties
          }
          pathLength={1}
          x1={pct(C.xInContent)}
          y1={pct(C.y)}
          x2={pct(B.xInContent)}
          y2={pct(B.y)}
          stroke="var(--alpha-dark-20)"
          strokeWidth="0.8"
          strokeDasharray={1}
          strokeDashoffset={1}
        />
        <line
          className="hero-decoration-line"
          style={
            {
              "--line-delay": "4100ms",
              "--line-duration": "680ms",
            } as CSSProperties
          }
          pathLength={1}
          x1={pct(B.xInContent)}
          y1={pct(B.y)}
          x2={pct(A.xInContent)}
          y2={pct(A.y)}
          stroke="var(--alpha-dark-20)"
          strokeWidth="0.8"
          strokeDasharray={1}
          strokeDashoffset={1}
        />
      </svg>

      <div className="absolute top-0 h-full" style={contentPlaneStyle}>
        <div
          className="hero-decoration-anchor absolute flex items-center gap-[14px] -translate-y-1/2"
          style={
            {
              left: dotLeft(A, -5),
              top: pct(A.y),
              "--anchor-delay": "120ms",
              opacity: 0,
            } as CSSProperties
          }
        >
          <div
            className="hero-decoration-dot size-[10px] shrink-0 bg-[var(--text-1)]"
            style={{ "--dot-breathe-delay": "1020ms" } as CSSProperties}
          />
          <span className="whitespace-nowrap font-miletus font-paragraph-14 text-[var(--text-1)]">
            Model APIs
          </span>
        </div>

        <div
          className="hero-decoration-anchor absolute flex -translate-x-full -translate-y-1/2 items-center gap-[14px]"
          style={
            {
              left: dotLeft(B, 5),
              top: pct(B.y),
              "--anchor-delay": "3740ms",
              opacity: 0,
            } as CSSProperties
          }
        >
          <span className="whitespace-nowrap font-miletus font-paragraph-14 text-[var(--text-1)]">
            Agent Sandbox
          </span>
          <div
            className="hero-decoration-dot size-[10px] shrink-0 bg-[var(--text-1)]"
            style={{ "--dot-breathe-delay": "4640ms" } as CSSProperties}
          />
        </div>

        <div
          className="hero-decoration-anchor absolute flex items-center gap-[14px] -translate-y-1/2"
          style={
            {
              left: dotLeft(C, -5),
              top: pct(C.y),
              "--anchor-delay": "1880ms",
              opacity: 0,
            } as CSSProperties
          }
        >
          <div
            className="hero-decoration-dot size-[10px] shrink-0 bg-[var(--text-1)]"
            style={{ "--dot-breathe-delay": "2780ms" } as CSSProperties}
          />
          <span className="whitespace-nowrap font-miletus font-paragraph-14 text-[var(--text-1)]">
            GPU Cloud
          </span>
        </div>
      </div>

      <style jsx>{`
        .hero-decoration-line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: hero-decoration-draw var(--line-duration) linear
            var(--line-delay) forwards;
        }

        .hero-decoration-anchor {
          opacity: 0;
          animation: hero-decoration-anchor-enter 360ms ease-out
            var(--anchor-delay) forwards;
          will-change: opacity;
        }

        .hero-decoration-dot {
          transform: scale(0.72);
          animation:
            hero-decoration-dot-enter 360ms ease-out var(--anchor-delay)
              forwards,
            hero-decoration-dot-breathe 3200ms ease-in-out
              var(--dot-breathe-delay) infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }

        @keyframes hero-decoration-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes hero-decoration-anchor-enter {
          to {
            opacity: 1;
          }
        }

        @keyframes hero-decoration-dot-enter {
          to {
            transform: scale(1);
          }
        }

        @keyframes hero-decoration-dot-breathe {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.72;
            transform: scale(1.18);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-decoration-line {
            stroke-dashoffset: 0;
            animation: none;
          }

          .hero-decoration-anchor {
            animation: hero-decoration-anchor-enter 1ms linear 0ms forwards;
            will-change: auto;
          }

          .hero-decoration-dot {
            transform: scale(1);
            animation: none;
            will-change: auto;
          }
        }
      `}</style>
    </div>
  );
}
