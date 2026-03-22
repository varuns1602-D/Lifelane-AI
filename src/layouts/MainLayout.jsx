import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LiveTrackingPanel from '../components/LiveTrackingPanel';

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="hidden md:flex w-80 flex-col" />
        <main className="flex-1 relative overflow-y-auto">
          {/* subtle city grid background effect */}
          <div className="absolute inset-0 bg-city-grid opacity-30 pointer-events-none" />
          <div className="relative z-10 h-full">
            <Outlet />
          </div>
        </main>
        <LiveTrackingPanel className="hidden lg:flex" />
      </div>
    </div>
  );
}
