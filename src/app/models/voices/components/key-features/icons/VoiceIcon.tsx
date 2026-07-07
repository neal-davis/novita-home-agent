import React from "react";

const FriendlyIcon: React.FC<React.SVGProps<SVGSVGElement>> = () => (
  <svg
    width="42"
    height="42"
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill={"var(--brand-0)"}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M38.1071 10.0563L37.1746 8.42879L33.9221 10.2938L34.8521 11.9213C38.0671 17.5313 38.0671 24.4913 34.8546 30.0838L33.9196 31.7088L37.1696 33.5763L38.1071 31.9513C41.9796 25.2088 41.9796 16.8188 38.1071 10.0563Z"
    />
    <path
      fill={"var(--brand-0)"}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.7264 9.90979H0.993906V11.1598C0.986406 17.7198 0.986406 24.2798 0.993906 30.8423V32.0898H12.7264L23.0414 41.0323H26.6964V0.967285H23.0414L12.7264 9.90979Z"
    />
  </svg>
);

FriendlyIcon.displayName = "FriendlyIcon";

export default FriendlyIcon;
