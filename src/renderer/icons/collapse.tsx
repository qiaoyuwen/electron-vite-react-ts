import { FC } from "react";

export const CollapseIcon: FC = () => {
  const color = "#9492AD";

  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g
        id="icon/收起"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <line
          x1="16"
          y1="7"
          x2="16"
          y2="16"
          id="路径备份-5"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform="translate(16.000000, 11.500000) rotate(-90.000000) translate(-16.000000, -11.500000) "
        />
        <line
          x1="12"
          y1="-5"
          x2="12"
          y2="12"
          id="路径备份-6"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform="translate(12.000000, 3.500000) rotate(-90.000000) translate(-12.000000, -3.500000) "
        />
        <line
          x1="12"
          y1="11"
          x2="12"
          y2="28"
          id="路径备份-7"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform="translate(12.000000, 19.500000) rotate(-90.000000) translate(-12.000000, -19.500000) "
        />
        <path
          d="M6.44727488,8.7469063 L10.4952293,12.7948607 C10.8857536,13.185385 10.8857536,13.81855 10.4952293,14.2090743 C10.3412223,14.3630813 10.1411461,14.4625979 9.92540965,14.4924988 L5.22613879,15.1438152 C4.67908346,15.2196368 4.17414196,14.8376264 4.09832038,14.290571 C4.08569545,14.1994817 4.08569545,14.1070862 4.09832038,14.0159968 L4.74963681,9.31672597 C4.82545838,8.76967064 5.33039988,8.38766021 5.87745521,8.46348178 C6.09319171,8.49338275 6.2932679,8.59289931 6.44727488,8.7469063 Z"
          id="路径备份-2"
          fill={color}
          fillRule="nonzero"
          transform="translate(7.916854, 11.325281) rotate(45.000000) translate(-7.916854, -11.325281) "
        />
      </g>
    </svg>
  );
};
