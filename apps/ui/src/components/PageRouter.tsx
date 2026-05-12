import React from 'react';
import { useUIStore } from '../store/uiStore';
import { Dashboard } from '../pages/Dashboard';
import { Squad } from '../pages/Squad';
import { Fixtures } from '../pages/Fixtures';
import { Transfers } from '../pages/Transfers';
import { Finances } from '../pages/Finances';
import { Facilities } from '../pages/Facilities';
import { Youth } from '../pages/Youth';
import { History } from '../pages/History';
import { Inbox } from '../pages/Inbox';

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
