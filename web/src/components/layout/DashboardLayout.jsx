import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMenu={() => setMenuOpen((o) => !o)} />
      <div className="flex flex-1">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
