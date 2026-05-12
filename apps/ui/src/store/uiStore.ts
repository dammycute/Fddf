import { create } from 'zustand';

type ActivePage =
  | 'dashboard' | 'squad' | 'fixtures' | 'transfers'
  | 'finances' | 'facilities' | 'youth' | 'history' | 'inbox';

interface UIState {
  activePage: ActivePage;
  selectedPlayerId: number | null;
  selectedFixtureId: number | null;
  sidebarCollapsed: boolean;
  readNewsIds: Set<number>;

  setPage: (page: ActivePage) => void;
  selectPlayer: (id: number | null) => void;
  selectFixture: (id: number | null) => void;
  toggleSidebar: () => void;
  markRead: (id: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePage: 'dashboard',
  selectedPlayerId: null,
  selectedFixtureId: null,
  sidebarCollapsed: false,
  readNewsIds: new Set<number>(),

  setPage: (activePage) => set({ activePage }),
  selectPlayer: (selectedPlayerId) => set({ selectedPlayerId }),
  selectFixture: (selectedFixtureId) => set({ selectedFixtureId }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  markRead: (id) => set((state) => {
    const next = new Set(state.readNewsIds);
    next.add(id);
    return { readNewsIds: next };
  })
}));
