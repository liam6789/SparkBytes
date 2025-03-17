"use client";
import React from "react";
import { Layout } from "antd";
import CustomHeader from "./components/header";

const { Content, Footer } = Layout;
const LayoutComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CustomHeader>
          {children}
        </CustomHeader>
      </body>
    </html>
    
  );
};

export default LayoutComponent;