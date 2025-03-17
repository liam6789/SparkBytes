'use client';

import React from "react";
import { Layout, Menu } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { useRouter} from "next/navigation";

const { Header } = Layout;
const CustomHeader = () => {
  // You'll need to edit this array
  const menuItems: { key: string; label: string; href: string }[] = [
    // each menu item must contain:
    // key: unique string (should be integer-like, e.g. '0' or '1')
    // label: string
    // href: string (route path) (should not have a trailing-slash, like '/news/'; '/news' is correct.)
    { key: '0', label: 'Home', href: '/'},
    { key: '1', label: 'About', href: '/about'},
    { key: '2', label: 'Events', href: '/events'},
    { key: '3', label: 'Login', href: '/login'}
  ];
  // Don't touch this code, use it in your Menu component from Antd
  const router = useRouter();
  const selectedKey = menuItems
    .findIndex((item) => item.href === router.pathname)
    .toString();

  const handleClick = (e: MenuInfo) => {
    const parsedKey = parseInt(e.key);
    if (parsedKey < 0 || parsedKey >= menuItems.length) return;
    router.push(menuItems[parsedKey].href);
  };

  // Start editing here
  return <Header style={{ display: "flex", alignItems: "center", backgroundColor: "#F55536"}}>
    <div style={{color:'white', marginRight: '16px'}}>SparkBytes</div>
    {menuItems.map(item => (
        <div 
          key={item.key} 
          onClick={() => router.push(item.href)}
          style={{
            backgroundColor: router.pathname === item.href ? '#52c41a' : 'transparent',
            color: 'white',
            padding: '0px 20px',
            cursor: 'pointer',
            display: "flex", 
            alignItems: "center"
          }}
        >
          {item.label}
        </div>
      ))}
  </Header>;
};

export default CustomHeader;
