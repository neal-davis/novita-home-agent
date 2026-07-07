import React from "react";

const ReliabilityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="42"
    height="48"
    viewBox="0 0 42 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M20.9984 0.470703C27.8603 5.08742 34.7247 8.78278 41.5866 11.5419C41.5866 29.662 34.7247 41.6571 20.9984 47.5295C7.27209 41.6571 0.410156 29.662 0.410156 11.5419C7.27209 8.78278 14.1365 5.0899 20.9984 0.470703ZM26.8382 17.1543L19.1019 25.4713L15.2385 21.3103L11.3704 25.4713L19.1043 33.7883L30.7064 21.3128L26.8382 17.1518V17.1543Z"
      fill={"var(--brand-0)"}
    />
  </svg>
);

ReliabilityIcon.displayName = "ReliabilityIcon";

export default ReliabilityIcon;
