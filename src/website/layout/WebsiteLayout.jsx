import React from 'react';
import { Outlet } from 'react-router-dom';
import WebsiteNavbar from '../components/WebsiteNavbar';
import WebsiteFooter from '../components/WebsiteFooter';

const WebsiteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <WebsiteNavbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <WebsiteFooter />
    </div>
  );
};

export default WebsiteLayout;
