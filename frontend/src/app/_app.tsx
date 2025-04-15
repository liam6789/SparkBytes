import React, {useEffect} from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import {useRouter, usePathname} from "next/navigation";
import LayoutComponent from "./layout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log(token)

    if (!token) {
      router.push("/login");
    }
  },[pathname, router]);

  return (
    <ConfigProvider>
      <LayoutComponent>
        <Component {...pageProps} />
      </LayoutComponent>
    </ConfigProvider>
  );
} 