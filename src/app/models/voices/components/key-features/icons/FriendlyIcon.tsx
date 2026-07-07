import React from "react";

const FriendlyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="38"
    height="34"
    viewBox="0 0 38 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M29.6029 0.532902C25.5184 -0.759065 21.7944 0.317256 19 3.55385C16.2036 0.313439 12.4796 -0.757157 8.39907 0.532902C3.24086 2.15883 0.0235541 6.72175 0.0001697 12.4392C-0.0465991 22.2368 9.58193 29.9123 18.6064 33.8282L19.0019 34L19.3975 33.8282C28.4239 29.9123 38.0485 22.2368 37.9998 12.4392C37.9764 6.72175 34.7591 2.15883 29.6029 0.532902Z"
      fill={"var(--brand-0)"}
    />
  </svg>
);

FriendlyIcon.displayName = "FriendlyIcon";

export default FriendlyIcon;
