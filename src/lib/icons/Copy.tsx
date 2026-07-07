import { useState } from "react";
import { IconProps } from "./type";

export default function Copy({
  color = "#000",
  hoverColor,
  width = 48,
  height = 48,
  opaque = false,
  style,
}: IconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <svg
      style={style}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        fill={opaque ? (isHovered ? hoverColor || color : color) : "none"}
        stroke={isHovered ? hoverColor || color : color}
        stroke-linecap="round"
        stroke-linejoin="round"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2577 12.2501H6.53268C5.87935 12.2501 5.55268 12.2501 5.30302 12.1217C5.08368 12.0109 4.90518 11.8301 4.79318 11.6142C4.66602 11.3634 4.66602 11.0367 4.66602 10.3834V5.65842C4.66602 5.00508 4.66602 4.67841 4.79318 4.42758C4.90518 4.21175 5.08368 4.03091 5.30302 3.92008C5.55268 3.79175 5.87935 3.79175 6.53268 3.79175H11.2577C11.911 3.79175 12.2377 3.79175 12.4873 3.92008C12.7067 4.03091 12.8852 4.21175 12.9972 4.42758C13.1243 4.67841 13.1243 5.00508 13.1243 5.65842V10.3834C13.1243 11.0367 13.1243 11.3634 12.9972 11.6142C12.8852 11.8301 12.7067 12.0109 12.4873 12.1217C12.2377 12.2501 11.911 12.2501 11.2577 12.2501Z"
      />
      <path
        stroke={isHovered ? hoverColor || color : color}
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M10.5 1.75H6.35833C5.05167 1.75 4.39833 1.75 3.899 2.00667C3.45975 2.22833 3.10275 2.58417 2.87933 3.02167C2.625 3.52333 2.625 4.17667 2.625 5.48333V9.625"
      />
    </svg>
  );
}
