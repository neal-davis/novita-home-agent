import React from "react";

const CustomizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M25.406 16.8886L18.987 10.4825L22.9938 6.48369L29.4128 12.8898L25.406 16.8886ZM5.83639 30.0129L5.83084 23.6142L17.0262 12.4412L23.4433 18.8474L12.248 30.0203L5.83639 30.0129ZM0.00195312 36H36.002V0H0.00195312V36Z"
      fill={"var(--brand-0)"}
    />
  </svg>
);

CustomizeIcon.displayName = "CustomizeIcon";

export default CustomizeIcon;
