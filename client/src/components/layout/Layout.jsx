import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProfileModal from './ProfileModal';
import { useAuth } from '../../context/AuthContext';

export default function Layout({ children }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Sticky Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <div className="flex-1 flex w-full relative">
        {/* Desktop Fixed Sidebar & Mobile Drawer */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Scrollable Main Content Container */}
        <div className="flex-1 md:pl-64 flex flex-col min-w-0 w-full min-h-[calc(100vh-4rem)]">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Global Personnel Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
