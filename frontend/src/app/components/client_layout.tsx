'use client';

import React from "react";
import { Layout } from "antd";
import CustomHeader from "./header";

const { Content, Footer } = Layout;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <CustomHeader />
      <Content style={{ padding: "24px" }}>
        {children}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Space! News ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}