'use client';

import React from "react";
import { Layout, Menu } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { useRouter, usePathname } from "next/navigation";
=======
import { useRouter, usePathname} from "next/navigation";
>>>>>>> cc8a068 (used app router to link the pages, implemented about page with short explanation and creator blurb)
=======
import { useRouter, usePathname} from "next/navigation";
>>>>>>> 43fba77 (used app router to link the pages, implemented about page with short explanation and creator blurb)
=======
import { useRouter, usePathname} from "next/navigation";
>>>>>>> 485b581 (added missing comma in menu item array)
=======
import { useRouter, usePathname } from "next/navigation";
>>>>>>> 002aae7 (used app router to link the pages, implemented about page with short explanation and creator blurb)

const { Header } = Layout;
const CustomHeader = () => {
  const menuItems = [
    { key: '0', label: 'Home', href: '/'},
    { key: '1', label: 'About', href: '/about'},
    { key: '2', label: 'Events', href: '/events'},
    { key: '3', label: 'Login', href: '/login'}
  ];
  
  const router = useRouter();
  const pathname = usePathname(); // This is what you use instead of router.pathname
  
  const handleClick = (e: MenuInfo) => {
    const parsedKey = parseInt(e.key);
    if (parsedKey < 0 || parsedKey >= menuItems.length) return;
    router.push(menuItems[parsedKey].href);
  };

  return <Header style={{ display: "flex", alignItems: "center", backgroundColor: "#F55536"}}>
    <div style={{color:'white', marginRight: '16px'}}>SparkBytes</div>
    {menuItems.map(item => (
        <div 
          key={item.key} 
          onClick={() => router.push(item.href)}
          style={{
            backgroundColor: pathname === item.href ? '#52c41a' : 'transparent',
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