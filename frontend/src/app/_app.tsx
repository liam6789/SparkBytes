import React from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import LayoutComponent from "./layout";

const App = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider>
    <LayoutComponent>
      <Component {...pageProps} />
    </LayoutComponent>
  </ConfigProvider>
);

export default App;