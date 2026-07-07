"use client";

export default function GpuChipPathDrawAnimation() {
  return (
    <div className="flex items-center justify-center w-full overflow-hidden">
      <div className="scene">
        <svg
          className="gpu-svg"
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect
            className="draw-frame"
            x="50"
            y="50"
            width="180"
            height="180"
            rx="32"
            stroke="#D4D8DE"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />

          <line
            className="draw-pin pin-t1"
            x1="120"
            y1="12"
            x2="120"
            y2="50"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            className="draw-pin pin-t2"
            x1="160"
            y1="12"
            x2="160"
            y2="50"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <line
            className="draw-pin pin-r1"
            x1="230"
            y1="120"
            x2="268"
            y2="120"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            className="draw-pin pin-r2"
            x1="230"
            y1="160"
            x2="268"
            y2="160"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <line
            className="draw-pin pin-b1"
            x1="120"
            y1="230"
            x2="120"
            y2="268"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            className="draw-pin pin-b2"
            x1="160"
            y1="230"
            x2="160"
            y2="268"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <line
            className="draw-pin pin-l1"
            x1="12"
            y1="120"
            x2="50"
            y2="120"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            className="draw-pin pin-l2"
            x1="12"
            y1="160"
            x2="50"
            y2="160"
            stroke="#D4D8DE"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <circle className="flow-dot flow-dot-1" cx="50" cy="50" r="3" />
          <circle className="flow-dot flow-dot-2" cx="190" cy="50" r="3" />
        </svg>

        <div className="chip-module-wrapper">
          <div className="chip-layer-back" />
          <div className="chip-layer-front lightning-glow">
            <svg
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M25.5 6L13 23h7l-3 15 15-19H23l3.5-13z"
                fill="#D1FAE5"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        .scene {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .gpu-svg {
          width: 280px;
          height: 280px;
        }

        .draw-frame {
          stroke-dasharray: 680;
          stroke-dashoffset: 680;
          animation: draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }

        .draw-pin {
          stroke-dasharray: 44;
          stroke-dashoffset: 44;
          animation: draw-pin 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }

        .pin-t1 {
          animation-delay: 0.6s;
        }
        .pin-t2 {
          animation-delay: 0.75s;
        }
        .pin-r1 {
          animation-delay: 0.9s;
        }
        .pin-r2 {
          animation-delay: 1.05s;
        }
        .pin-b1 {
          animation-delay: 1.2s;
        }
        .pin-b2 {
          animation-delay: 1.35s;
        }
        .pin-l1 {
          animation-delay: 1.5s;
        }
        .pin-l2 {
          animation-delay: 1.65s;
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes draw-pin {
          to {
            stroke-dashoffset: 0;
          }
        }

        .chip-module-wrapper {
          position: absolute;
          width: 112px;
          height: 112px;
          opacity: 0;
          transform: scale(0.5);
          animation:
            chip-appear 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 2s forwards,
            chip-float 5s ease-in-out 2.7s infinite;
        }

        @keyframes chip-appear {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes chip-float {
          0%,
          100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1) translateY(-8px);
          }
        }

        .chip-layer-back {
          position: absolute;
          width: 92px;
          height: 92px;
          left: 50%;
          top: 50%;
          background: #d4d8de;
          border-radius: 18px;
          transform: translate(-50%, -50%) rotate(-10deg);
        }

        .chip-layer-front {
          position: absolute;
          width: 92px;
          height: 92px;
          left: 50%;
          top: 50%;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          transform: translate(-50%, -50%) rotate(14deg) skewX(-2deg);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .chip-layer-front::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0) 100%
          );
          border-radius: 18px 18px 0 0;
          pointer-events: none;
        }

        .chip-layer-front svg {
          width: 56px;
          height: 56px;
          position: relative;
          z-index: 1;
        }

        .lightning-glow {
          filter: drop-shadow(0 0 0px rgba(16, 185, 129, 0));
          animation: glow-pulse 2s ease-in-out 2.7s infinite;
        }

        @keyframes glow-pulse {
          0%,
          100% {
            filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
          }
        }

        .flow-dot {
          fill: #10b981;
          opacity: 0;
        }

        .flow-dot-1 {
          animation:
            flow-appear 0.3s ease 1.8s forwards,
            flow-move-1 3s linear 2.1s infinite;
        }

        .flow-dot-2 {
          animation:
            flow-appear 0.3s ease 1.9s forwards,
            flow-move-2 3.5s linear 2.2s infinite;
        }

        @keyframes flow-appear {
          to {
            opacity: 0.7;
          }
        }

        @keyframes flow-move-1 {
          0% {
            transform: translate(0, 0);
            opacity: 0.7;
          }
          25% {
            transform: translate(140px, 0);
            opacity: 0.5;
          }
          50% {
            transform: translate(140px, 140px);
            opacity: 0.3;
          }
          75% {
            transform: translate(0, 140px);
            opacity: 0.5;
          }
          100% {
            transform: translate(0, 0);
            opacity: 0.7;
          }
        }

        @keyframes flow-move-2 {
          0% {
            transform: translate(140px, 70px);
            opacity: 0.5;
          }
          25% {
            transform: translate(70px, 140px);
            opacity: 0.7;
          }
          50% {
            transform: translate(0, 70px);
            opacity: 0.5;
          }
          75% {
            transform: translate(70px, 0);
            opacity: 0.7;
          }
          100% {
            transform: translate(140px, 70px);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
