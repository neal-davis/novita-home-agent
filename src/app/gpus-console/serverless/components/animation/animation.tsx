"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  target?: number;
  durationMs?: number;
  delayMs?: number;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function ServerlessReadyAnimation({
  target = 99.9,
  durationMs = 2500,
  delayMs = 500,
}: Props) {
  const [value, setValue] = useState(0);
  const formatted = useMemo(() => `${value.toFixed(1)}%`, [value]);

  useEffect(() => {
    let raf = 0;
    let timeoutId: number | undefined = undefined;

    timeoutId = window.setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / durationMs, 1);
        setValue(target * easeOutCubic(p));
        if (p < 1) raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [delayMs, durationMs, target]);

  return (
    <div className="flex items-center justify-center w-full overflow-hidden">
      <div className="scene">
        <div className="square square-back" />
        <div className="square square-mid" />

        <div className="main-card">
          <div className="chip-graphic">
            <svg
              className="chip-svg"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect
                x="22"
                y="22"
                width="76"
                height="76"
                rx="10"
                stroke="#a0a4ae"
                strokeWidth="2.5"
                fill="#f4f5f7"
              />
              <rect
                x="30"
                y="30"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />
              <rect
                x="51"
                y="30"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />
              <rect
                x="72"
                y="30"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />
              <rect
                x="30"
                y="51"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />
              <rect
                x="72"
                y="51"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />
              <rect
                x="30"
                y="72"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />
              <rect
                x="51"
                y="72"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />
              <rect
                x="72"
                y="72"
                width="18"
                height="18"
                rx="4"
                fill="#c8cad0"
              />

              <line
                x1="42"
                y1="8"
                x2="42"
                y2="22"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="8"
                x2="60"
                y2="22"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="78"
                y1="8"
                x2="78"
                y2="22"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <line
                x1="42"
                y1="98"
                x2="42"
                y2="112"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="98"
                x2="60"
                y2="112"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="78"
                y1="98"
                x2="78"
                y2="112"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <line
                x1="8"
                y1="42"
                x2="22"
                y2="42"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="60"
                x2="22"
                y2="60"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="78"
                x2="22"
                y2="78"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <line
                x1="98"
                y1="42"
                x2="112"
                y2="42"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="98"
                y1="60"
                x2="112"
                y2="60"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="98"
                y1="78"
                x2="112"
                y2="78"
                stroke="#b0b3bb"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="chip-light" />
          </div>

          <div className="bottom-dots" aria-hidden>
            <div className="dot" />
            <div className="dot green" />
            <div className="dot" />
          </div>

          <div className="status-text">
            <div className="status-label">Serverless Ready</div>
            <div className="status-percent">{formatted}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        .scene {
          position: relative;
          width: 286px;
          height: 286px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .square {
          position: absolute;
          width: 202px;
          height: 202px;
          border-radius: 26px;
        }

        .square-back {
          background: #e8e9ed;
          animation: sq-outer 25s linear infinite;
        }

        @keyframes sq-outer {
          from {
            transform: rotate(-6deg);
          }
          to {
            transform: rotate(-366deg);
          }
        }

        .square-mid {
          background: #dfe0e5;
          animation: sq-inner 30s linear infinite;
        }

        @keyframes sq-inner {
          from {
            transform: rotate(6deg);
          }
          to {
            transform: rotate(366deg);
          }
        }

        .main-card {
          position: relative;
          width: 202px;
          height: 202px;
          background: #ffffff;
          border-radius: 26px;
          padding: 14px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 2;
          cursor: pointer;
          animation: card-float 6s ease-in-out infinite;
          transition: transform 0.2s ease;
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.07),
            0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .main-card:hover {
          transform: scale(1.02);
        }

        .main-card:active {
          transform: scale(0.98);
        }

        @keyframes card-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .chip-graphic {
          width: 88px;
          height: 88px;
          margin: 0 auto 8px;
          position: relative;
          animation: chip-intro 0.8s ease-out 0.2s both;
        }

        @keyframes chip-intro {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chip-svg {
          width: 100%;
          height: 100%;
        }

        .chip-light {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          background: #4aba82;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: green-pulse 2s ease-in-out infinite;
        }

        @keyframes green-pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.72;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.25);
            opacity: 1;
          }
        }

        .bottom-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 6px 0 8px;
        }

        .dot {
          width: 7px;
          height: 7px;
          background: #c0c3ca;
          border-radius: 50%;
        }

        .dot.green {
          background: #4aba82;
          animation: bottom-pulse 1.5s ease-in-out 0.5s infinite;
        }

        @keyframes bottom-pulse {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        .status-text {
          animation: text-intro 0.8s ease-out 0.6s both;
        }

        @keyframes text-intro {
          from {
            transform: translateY(15px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .status-label {
          font-size: 11px;
          font-weight: 700;
          color: #6b7080;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .status-percent {
          font-size: 26px;
          font-weight: 800;
          color: #6b7080;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
