'use client';

import React, {useEffect, useState} from "react";
import { Layout, Menu, Modal } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { useRouter, usePathname} from "next/navigation";

const { Header } = Layout;
const CustomHeader = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [menuItems, setMenuItems] = useState<{key: string, label: string, href: string}[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname(); // This is what you use instead of router.pathname

  useEffect(() => {
    const fetchType = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMenuItems([
          { key: "0", label: "Home", href: "/" },
          { key: "1", label: "About", href: "/about" },
        ]);
        setLoggedIn(false);
        return;
      }
      const user = localStorage.getItem('user')
      if (user) {
        setUserType(JSON.parse(user).role)
      }
      if (userType === 'event_creator') {
        const tempItems = [
          { key: '0', label: 'Home', href: '/'},
          { key: '1', label: 'About', href: '/about'},
          { key: '2', label: 'My Events', href: '/host/events'},
          { key: '3', label: 'Create Event', href: '/host/createevent'},
          { key: '4', label: 'Profile', href: '/host/profile'},
        ];
        setMenuItems(tempItems);
      } else if (userType === 'regular_user') {
        const tempItems = [
          { key: '0', label: 'Home', href: '/'},
          { key: '1', label: 'About', href: '/about'},
          { key: '2', label: 'Events', href: '/user/events'},
          { key: '3', label: 'Create Reservation', href: '/user/reservation'},
          { key: '4', label: 'Rating Forme', href: "/user/ratingform"},
          { key: '5', label: 'Profile', href: "/user/profile"},
        ];
        setMenuItems(tempItems);
      }
    }

    fetchType();
  }, [router, pathname, userType]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setLoggedIn(true);
    }
    console.log(loggedIn)
  },[router, pathname]);
  
  // const handleClick = (e: MenuInfo) => {
  //   const parsedKey = parseInt(e.key);
  //   if (parsedKey < 0 || parsedKey >= menuItems.length) return;
  //   router.push(menuItems[parsedKey].href);
  // };
  
  return (
    <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F55536"}}>
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
        {/* <div
          onClick={() => router.push('/user-profile')}
          style={{
            color: 'white',
            padding: '0px 20px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Profile
        </div> */}
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
                localStorage.removeItem('user');
                setUserType(null);
                setLoggedIn(false);
                router.push('/login');
            }}
            onCancel={() => {
                setConfirm(false)
            }}
        >
            {"You must log back in to continue if you confirm."}
        </Modal></>
        : 
        <div
          style={{display:"flex", gap: "20px"}}>
          <div
            key={'5'}
            onClick={() => router.push('/login')}
            style={{
              backgroundColor: pathname === '/login' ? '#52c41a' : 'transparent',
              color: 'white',
              padding: '0px 20px',
              cursor: 'pointer',
              display: "flex", 
              alignItems: "center"
            }}
          >Log In</div>
          <div
            key={'6'}
            onClick={() => router.push('/register')}
            style={{
              backgroundColor: pathname === '/register' ? '#52c41a' : 'transparent',
              color: 'white',
              padding: '0px 20px',
              cursor: 'pointer',
              display: "flex",
              alignItems: "center"
            }}
          > Register
          </div>
        </div>
        }
    </Header>
  );
};

export default CustomHeader;