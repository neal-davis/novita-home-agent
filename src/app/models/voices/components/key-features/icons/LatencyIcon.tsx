import React from "react";

const LatencyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="42"
    height="42"
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21 42C32.598 42 42 32.598 42 21C42 9.40202 32.598 0 21 0C9.40202 0 0 9.40202 0 21C0 32.598 9.40202 42 21 42ZM27.0309 17.0622C27.3759 16.6309 27.306 16.0016 26.8747 15.6566C26.4434 15.3116 25.8141 15.3815 25.4691 15.8128L20.7919 21.6594L13.6797 16.9179C13.2202 16.6116 12.5993 16.7358 12.2929 17.1953C11.9866 17.6548 12.1108 18.2757 12.5703 18.5821L20.2546 23.7049C20.7941 24.0646 21.519 23.952 21.9241 23.4457L27.0309 17.0622Z"
      fill={"var(--brand-0)"}
    />
  </svg>
);

LatencyIcon.displayName = "LatencyIcon";

export default LatencyIcon;
