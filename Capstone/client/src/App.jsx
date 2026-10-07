import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import ParticipantPortal from './components/ParticipantPortal.jsx';
import RegistrationModal from './components/RegistrationModal.jsx';
import TicketPassModal from './components/TicketPassModal.jsx';
import MyTicketsModal from './components/MyTicketsModal.jsx';

// Admin Components
import AdminLayout from './components/admin/AdminLayout.jsx';
import AnalyticsOverview from './components/admin/AnalyticsOverview.jsx';
import EventManager from './components/admin/EventManager.jsx';
import RegistrationsManager from './components/admin/RegistrationsManager.jsx';
import AnnouncementBroadcast from './components/admin/AnnouncementBroadcast.jsx';
import TicketScannerModal from './components/admin/TicketScannerModal.jsx';

export default function App() {
  const [role, setRole] = useState('participant'); // 'participant' | 'admin'
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'events' | 'registrations' | 'announcements' | 'scanner'
  const [adminEventFilter, setAdminEventFilter] = useState('All');

  // Modals state
  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [activeTicketPass, setActiveTicketPass] = useState(null);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);

  const handleRegisterEvent = (event) => {
    setRegisteringEvent(event);
  };

  const handleRegistrationSuccess = (issuedTicket) => {
    setRegisteringEvent(null);
    setActiveTicketPass(issuedTicket);
  };

  const handleOpenMyTickets = () => {
    setIsMyTicketsOpen(true);
  };

  const handleViewPassFromLookup = (pass) => {
    setIsMyTicketsOpen(false);
    setActiveTicketPass(pass);
  };

  const handleManageEventRegistrations = (eventId) => {
    setAdminEventFilter(eventId);
    setAdminTab('registrations');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      
      {role === 'participant' ? (
        <>
          {/* Public Top Navbar with Akira Logo and Role Toggle */}
          <Navbar
            currentRole={role}
            setRole={setRole}
            onOpenMyTickets={handleOpenMyTickets}
          />

          {/* Main Participant Portal */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
            <ParticipantPortal
              onRegisterEvent={handleRegisterEvent}
              onOpenMyTickets={handleOpenMyTickets}
            />
          </main>

          {/* Footer */}
          <footer className="bg-navy-950 border-t border-slate-800 text-slate-400 py-8 px-4 text-center text-xs space-y-2 mt-auto">
            <div className="flex items-center justify-center gap-2">
              <span className="font-display text-xs tracking-wider text-slate-200">EVENTFLOW</span>
              <span>•</span>
              <span className="font-heading font-medium text-slate-400">Campus Event Coordination Operating System</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Built for TechTrove Hackathon 2026. Empowering college organizers, department societies, and student attendees.
            </p>
          </footer>
        </>
      ) : (
        /* Organizer & Admin SaaS Command Center */
        <AdminLayout
          activeTab={adminTab}
          setActiveTab={(tab) => {
            if (tab !== 'registrations') setAdminEventFilter('All');
            setAdminTab(tab);
          }}
          onSwitchToParticipant={() => setRole('participant')}
        >
          {adminTab === 'overview' && <AnalyticsOverview />}
          {adminTab === 'events' && (
            <EventManager onManageRegistrations={handleManageEventRegistrations} />
          )}
          {adminTab === 'registrations' && (
            <RegistrationsManager initialEventId={adminEventFilter} />
          )}
          {adminTab === 'announcements' && <AnnouncementBroadcast />}
          {adminTab === 'scanner' && <TicketScannerModal />}
        </AdminLayout>
      )}

      {/* Shared Modals */}
      <RegistrationModal
        event={registeringEvent}
        isOpen={!!registeringEvent}
        onClose={() => setRegisteringEvent(null)}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

      <TicketPassModal
        ticket={activeTicketPass}
        isOpen={!!activeTicketPass}
        onClose={() => setActiveTicketPass(null)}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        onViewPass={handleViewPassFromLookup}
      />

    </div>
  );
}
