import React from "react";

const IntegrationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="43"
    height="42"
    viewBox="0 0 43 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M23.6654 28.1249L23.1913 28.9455H21.339L20.7811 28.2218C20.7481 28.1723 17.469 23.3865 13.2308 20.7674L11.8305 19.9058L13.599 17.1748L14.9949 18.0363C18.049 19.9209 20.5849 22.6735 22.0799 24.5108C24.4284 21.0538 29.928 13.8535 38.3626 8.01446C34.4221 3.14246 28.3337 0 21.5 0C9.64523 0 0 9.42092 0 21C0 32.5791 9.64523 42 21.5 42C33.3548 42 43 32.5791 43 21C43 17.2588 41.9812 13.7523 40.2193 10.7068C29.5619 18.1289 23.7294 28.0151 23.6654 28.1249Z"
      fill={"var(--brand-0)"}
    />
  </svg>
);

IntegrationIcon.displayName = "IntegrationIcon";

export default IntegrationIcon;
