import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

// Self-hosted: no render-blocking round trip to fonts.googleapis.com before
// the first paint.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Savee Motion Studio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Construct animation templates from your inspo." />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--font-sans:${inter.style.fontFamily},system-ui,sans-serif;}`,
          }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
