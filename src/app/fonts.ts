import localFont from "next/font/local";

export const miletusGrotesk = localFont({
  src: [
    {
      path: "../fonts/MiletusGroteskTrial-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/MiletusGroteskTrial-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/MiletusGroteskTrial-Medium.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/MiletusGroteskTrial-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-miletus",
});

export const ttMono = localFont({
  src: [
    {
      path: "../fonts/TT_Interphases_Pro_Mono_Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-tt-mono",
});
