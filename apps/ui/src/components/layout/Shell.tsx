import React from 'react';
import {
  LayoutDashboard, Users, Calendar, ArrowsLeftRight,
  BarChart3, Building2, School, Trophy, Bell,
  ChevronLeft, ChevronRight, Play
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { StatBar } from './StatBar';
import { Badge } from './Badge';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { club, leagueTable, manager, isLoading, tick, playerClubId } = useGameStore();
  const { activePage, setPage, sidebarCollapsed, toggleSidebar } = useUIStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'squad', label: 'Squad', icon: Users },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'transfers', label: 'Transfers', icon: ArrowsLeftRight },
    { id: 'finances', label: 'Finances', icon: BarChart3 },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'youth', label: 'Youth Academy', icon: School },
    { id: 'history', label: 'History', icon: Trophy },
    { id: 'inbox', label: 'Inbox', icon: Bell },
  ] as const;

  const playerClubStanding = leagueTable.find(r => r.club_name === club?.name);
  const form = playerClubStanding?.form || [];

  return (
    <div className="h-screen w-screen grid grid-cols-[auto_1fr] grid-rows-[48px_1fr] bg-[#0f1117] text-[#e8eaf0] overflow-hidden font-sans">

      {/* LEFT SIDEBAR */}
      <aside
        className={`row-span-2 bg-[#1a1d26] border-r border-[#ffffff12] flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-[56px]' : 'w-[240px]'}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-3 border-b border-[#ffffff12] gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex-shrink-0 flex items-center justify-center font-bold text-xs">
            {club?.name?.substring(0, 2).toUpperCase() || 'FC'}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{club?.name || 'Football Club'}</div>
              <div className="text-[10px] text-[#9399a8] truncate">Premier League</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`
                  w-full h-10 flex items-center px-4 gap-3 transition-colors relative group
                  ${isActive ? 'bg-[#21253a] text-[#3b82f6]' : 'text-[#9399a8] hover:bg-[#21253a] hover:text-[#e8eaf0]'}
                `}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#3b82f6]" />}
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-[13px] font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#ffffff12] space-y-3">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
               <div className="text-[11px] font-mono text-[#9399a8]">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-[#21253a] rounded text-[#9399a8]"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <button
            onClick={tick}
            disabled={isLoading}
            className={`
              w-full h-10 bg-[#3b82f6] hover:bg-[#1d4ed8] disabled:bg-[#3b82f650]
              rounded flex items-center justify-center gap-2 font-bold text-sm transition-all
              ${sidebarCollapsed ? 'p-0' : 'px-4'}
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                {!sidebarCollapsed && <span>CONTINUE</span>}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* TOP BAR */}
      <header className="bg-[#1a1d26] border-b border-[#ffffff12] flex items-center px-6 justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-sm font-bold uppercase tracking-wider text-[#9399a8]">
            {activePage}
          </h1>

          {/* Form Indicators */}
          <div className="flex gap-1">
            {form.map((res, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold
                  ${res === 'W' ? 'bg-[#22c55e] text-black' : res === 'D' ? 'bg-[#f59e0b] text-black' : 'bg-[#ef4444] text-white'}
                `}
              >
                {res}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Balance */}
          <div className="text-right">
            <div className="text-[10px] text-[#9399a8] uppercase font-bold tracking-tight">Balance</div>
            <div className="text-sm font-mono font-bold text-[#22c55e]">
              £{(club?.balance || 0).toLocaleString()}
            </div>
          </div>

          {/* Fan Sentiment */}
          <div className="w-24">
            <div className="text-[10px] text-[#9399a8] uppercase font-bold tracking-tight mb-1">Fans</div>
            <StatBar value={75} size="sm" />
          </div>

          {/* Manager Morale */}
          <div className="w-24">
            <div className="text-[10px] text-[#9399a8] uppercase font-bold tracking-tight mb-1">Manager</div>
            <StatBar value={manager?.morale || 50} size="sm" />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="overflow-y-auto p-6 relative">
        {children}
      </main>
    </div>
  );
};
