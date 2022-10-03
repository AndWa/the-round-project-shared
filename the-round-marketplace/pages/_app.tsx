import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import "@near-wallet-selector/modal-ui/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ParallaxProvider } from "react-scroll-parallax";
import { CustomFonts } from "../components/Fonts/CustomFonts.component";
import AdminLayout from "../components/Layouts/admin.layout";
import CustomerLayout from "../components/Layouts/customer.layout";
import { NearPriceContextProvider } from "../context/NearPriceContext";
import { UserContextProvider } from "../context/UserContext";
import { WalletSelectorContextProvider } from "../context/WalletSelectorContext";
import "../styles/globals.css";
import "../utils/firebase.config";

const queryClient = new QueryClient();

function App({ Component, pageProps, router }: AppProps) {
  const preferredColorScheme = useColorScheme();

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const adminPanel = router.route.startsWith("/admin") ? true : false;

  const getLayout = adminPanel
    ? (page: any) => <AdminLayout>{page}</AdminLayout>
    : (page: any) => <CustomerLayout>{page}</CustomerLayout>;

  return (
    <>
      <Head>
        <title>The Round</title>
        <meta name="description" content="The Round" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <UserContextProvider>
          <NearPriceContextProvider>
            <WalletSelectorContextProvider>
              <ColorSchemeProvider
                colorScheme={colorScheme}
                toggleColorScheme={toggleColorScheme}
              >
                <MantineProvider
                  withGlobalStyles
                  withNormalizeCSS
                  theme={{
                    primaryColor: colorScheme === "dark" ? "gray" : "dark",
                    colorScheme,
                    defaultRadius: "xs",
                    loader: "oval",
                    fontFamily: "Degular display, sans-serif",
                    components: {
                      Input: {
                        styles: (theme) => ({
                          input: {
                            borderColor:
                              theme.colors.dark[theme.fn.primaryShade()],
                          },
                        }),
                      },
                    },
                  }}
                >
                  <ModalsProvider>
                    <NotificationsProvider>
                      <ParallaxProvider>
                        <CustomFonts />
                        {getLayout(<Component {...pageProps} />)}
                      </ParallaxProvider>
                    </NotificationsProvider>
                  </ModalsProvider>
                </MantineProvider>
              </ColorSchemeProvider>
            </WalletSelectorContextProvider>
          </NearPriceContextProvider>
        </UserContextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default App;
