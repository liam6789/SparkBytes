"use client";
import React from "react";
import { Layout } from "antd";
import { useRouter, usePathname} from "next/navigation";
import { useEffect, useState } from "react";
import CustomHeader from "./components/header";

const { Content, Footer } = Layout;
const LayoutComponent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  const publicRoutes = ["/", "/about", "/login", "/register", "/forgot-password", "/reset-password"];

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");

      if (publicRoutes.includes(pathname)) {
        setLoading(false)
        return
      }

      if (!token) {
        router.push("/login");
        return;
      }
  
      const response = await fetch('http://localhost:5001/me', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });
  
      if (response.ok) {
        const userData = await response.json();
        setUserType(userData.role);
        if (userData.role === 'event_creator' && pathname.startsWith('/user')) {
          router.push('/')
        } else if (userData.role === 'event_creator' && pathname.startsWith('/events/')) {
          router.push(`/host/${pathname}`)
        } else if (userData.role === 'regular_user' && pathname.startsWith('/host')) {
          router.push(`/`)
        } else {
          setLoading(false);
        }
      }
    }

    fetchUserData();
  }, [router, pathname])

  if (!loading) {
    return (
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>
          <Layout className="layout" style={{ minHeight: "100vh" }}>
            <CustomHeader/>
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
  }
  return (
    <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>
          <div>Loading. If it takes a while try refreshing the page!!!</div>
        </body>
      </html>
  )
};

export default LayoutComponent;