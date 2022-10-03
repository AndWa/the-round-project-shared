import { Global } from "@mantine/core";

export function CustomFonts() {
  return (
    <Global
      styles={[
        {
          "@font-face": {
            fontFamily: "Degular display",
            src: `url('/fonts/Degular_Display-Light.woff2') format("woff2")`,
            fontWeight: 300,
            fontStyle: "normal",
            fontDisplay: "swap",
          },
        },
        {
          "@font-face": {
            fontFamily: "Degular display",
            src: `url('/fonts/Degular_Display-Medium.woff2') format("woff2")`,
            fontWeight: 500,
            fontStyle: "normal",
            fontDisplay: "swap",
          },
        },
        {
          "@font-face": {
            fontFamily: "Degular display",
            src: `url('/fonts/Degular_Display-Regular.woff2') format("woff2")`,
            fontWeight: 400,
            fontStyle: "normal",
            fontDisplay: "swap",
          },
        },
      ]}
    />
  );
}
