'use client';

import React, {useEffect, useState} from "react";
import { Layout, Menu, Modal } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { useRouter, usePathname} from "next/navigation";

const { Header } = Layout;
const CustomHeader = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [confirm, setConfirm] = useState(false);
  // const [userType, setUserType] = useState(''); // 'host' or 'regular-user'

  const menuItems = [
    { key: '0', label: 'Home', href: '/'},
    { key: '1', label: 'About', href: '/about'},
    { key: '2', label: 'Events', href: '/events'},
    { key: '3', label: 'Login', href: '/login'},
    { key: '4', label: 'Reservations', href: '/reservation'}
  ];
  
  const router = useRouter();
  const pathname = usePathname(); // This is what you use instead of router.pathname

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setLoggedIn(true);
    }
    console.log(loggedIn)
  },[router, pathname]);
  
  const handleClick = (e: MenuInfo) => {
    const parsedKey = parseInt(e.key);
    if (parsedKey < 0 || parsedKey >= menuItems.length) return;
    router.push(menuItems[parsedKey].href);
  };

  return (
    <Header style={{ display: "flex", alignItems: "center", backgroundColor: "#F55536"}}>
      <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{color:'white', marginRight: '16px'}}><strong style={{fontSize:"20px"}}>SparkBytes</strong></div>
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
        </div>

        {/* Right side: profile button */}
        <div
          onClick={() => router.push('/user-profile')}
          style={{
            color: 'white',
            padding: '0px 20px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Profile
        </div>
        {loggedIn ? <><div
          key={'5'}
          onClick={() => {
            setConfirm(true)
          }}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            padding: '0px 20px',
            cursor: 'pointer',
            display: "flex", 
            alignItems: "center"
          }}
        >Log Out</div> 
        <Modal
            title="Are you sure you want to log out?"
            open={confirm}
            okType="danger"
            onOk={() => {
                setConfirm(false)
                localStorage.removeItem('accessToken');
                setLoggedIn(false);
                router.push('/login');
            }}
            onCancel={() => {
                setConfirm(false)
            }}
        >
            {"You must log back in to continue if you confirm."}
        </Modal></>
        : null}
    </Header>
  );
};

export default CustomHeader;