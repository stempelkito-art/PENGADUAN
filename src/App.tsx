import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LoginModal } from './components/common/LoginModal';
import { HomeSection } from './components/public/HomeSection';
import { CreateComplaintForm } from './components/public/CreateComplaintForm';
import { TrackComplaintSection } from './components/public/TrackComplaintSection';
import { InfoSection } from './components/public/InfoSection';
import { FaqSection } from './components/public/FaqSection';
import { ContactSection } from './components/public/ContactSection';
import { AdminLayout } from './components/admin/AdminLayout';

const MainAppContent: React.FC = () => {
  const { 
    viewMode, 
    isOfficerLoggedIn,
    publicActiveTab, 
    setPublicActiveTab,
    setSelectedComplaintId 
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);

  // Officer dashboard requires verified login session
  if (viewMode === 'admin' && isOfficerLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
        <AdminLayout onOpenNotifications={() => setNotificationOpen(true)} />
        
        {/* Notification Drawer */}
        <NotificationDrawer
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
        />

        {/* Global Officer Login & Account Switcher Modal */}
        <LoginModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Global App Header (Public Portal) */}
      <Header onOpenNotifications={() => setNotificationOpen(true)} />

      {/* Main View Area */}
      <div className="flex-1">
        <div>
          {publicActiveTab === 'beranda' && <HomeSection />}
          {publicActiveTab === 'buat-pengaduan' && (
            <CreateComplaintForm
              onSuccessTrack={(id) => {
                setSelectedComplaintId(id);
                setPublicActiveTab('lacak-pengaduan');
              }}
            />
          )}
          {publicActiveTab === 'lacak-pengaduan' && <TrackComplaintSection />}
          {publicActiveTab === 'informasi' && <InfoSection />}
          {publicActiveTab === 'faq' && <FaqSection />}
          {publicActiveTab === 'kontak' && <ContactSection />}

          {/* Public Footer */}
          <Footer />
        </div>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Global Officer Login & Account Switcher Modal */}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
