"use client";
import React from "react";
import { Layout } from "antd";
import { useRouter, usePathname} from "next/navigation";
import { useEffect } from "react";
import CustomHeader from "./components/header";

const { Content, Footer } = Layout;
const LayoutComponent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
    }
  }, [router, pathname])

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Layout className="layout" style={{ minHeight: "100vh" }}>
          <CustomHeader />
          <Content style={{ padding: "0 50px", marginTop: 0 }}>
            <div
              className="site-layout-content"
              style={{ padding: 24, minHeight: 380, height: "100%" }}
            >
              {children}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Spark! ©2025 Created by Spark!</Footer>
        </Layout>
      </body>
    </html>
    
  );
};

export default LayoutComponent;