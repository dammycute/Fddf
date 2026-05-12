import React from 'react';
import { useUIStore } from '../store/uiStore';

// Placeholder components
const Dashboard = () => <div className="text-2xl font-bold">Dashboard</div>;
const Squad = () => <div className="text-2xl font-bold">Squad View</div>;
const Fixtures = () => <div className="text-2xl font-bold">Fixtures & Results</div>;
const Transfers = () => <div className="text-2xl font-bold">Transfer Market</div>;
const Finances = () => <div className="text-2xl font-bold">Financial Overview</div>;
const Facilities = () => <div className="text-2xl font-bold">Club Facilities</div>;
const Youth = () => <div className="text-2xl font-bold">Youth Academy</div>;
const History = () => <div className="text-2xl font-bold">Club History</div>;
const Inbox = () => <div className="text-2xl font-bold">Inbox</div>;

export const PageRouter: React.FC = () => {
  const activePage = useUIStore((state) => state.activePage);

  switch (activePage) {
    case 'dashboard': return <Dashboard />;
    case 'squad': return <Squad />;
    case 'fixtures': return <Fixtures />;
    case 'transfers': return <Transfers />;
    case 'finances': return <Finances />;
    case 'facilities': return <Facilities />;
    case 'youth': return <Youth />;
    case 'history': return <History />;
    case 'inbox': return <Inbox />;
    default: return null;
  }
};
