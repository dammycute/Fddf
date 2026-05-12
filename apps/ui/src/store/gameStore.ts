import { create } from 'zustand';
import * as api from '../api/engine';
import {
  ClubInfo, Player, Fixture, LeagueRow, Manager,
  NewsEvent, TransferOffer, Facilities, YouthPlayer
} from '../types';

interface GameState {
  playerClubId: number | null;
  club: ClubInfo | null;
  squad: Player[];
  fixtures: Fixture[];
  leagueTable: LeagueRow[];
  manager: Manager | null;
  newsFeed: NewsEvent[];
  transferOffers: TransferOffer[];
  facilities: Facilities | null;
  youthPlayers: YouthPlayer[];
  isLoading: boolean;
  lastTickDate: string | null;

  initialize: (clubId: number) => Promise<void>;
  tick: () => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerClubId: null,
  club: null,
  squad: [],
  fixtures: [],
  leagueTable: [],
  manager: null,
  newsFeed: [],
  transferOffers: [],
  facilities: null,
  youthPlayers: [],
  isLoading: false,
  lastTickDate: null,

  initialize: async (clubId: number) => {
    set({ isLoading: true, playerClubId: clubId });
    try {
      const [
        club, squad, fixtures, leagueTable,
        manager, newsFeed, transferOffers, facilities, youthPlayers
      ] = await Promise.all([
        api.getClub(clubId),
        api.getSquad(clubId),
        api.getFixtures(clubId),
        api.getLeagueTable(1), // Assuming league 1 for now
        api.getManagerInfo(clubId),
        api.getNewsFeed(20),
        api.getTransferOffers(clubId),
        api.getFacilities(clubId),
        api.getYouthPlayers(clubId)
      ]);

      set({
        club, squad, fixtures, leagueTable,
        manager, newsFeed, transferOffers, facilities, youthPlayers,
        isLoading: false
      });
    } catch (error) {
      console.error("Initialization failed:", error);
      set({ isLoading: false });
    }
  },

  tick: async () => {
    const clubId = get().playerClubId;
    if (!clubId) return;

    set({ isLoading: true });
    try {
      await api.nextTick();
      // Re-fetch everything
      const [
        club, squad, fixtures, leagueTable,
        manager, newsFeed, transferOffers, facilities, youthPlayers
      ] = await Promise.all([
        api.getClub(clubId),
        api.getSquad(clubId),
        api.getFixtures(clubId),
        api.getLeagueTable(1),
        api.getManagerInfo(clubId),
        api.getNewsFeed(20),
        api.getTransferOffers(clubId),
        api.getFacilities(clubId),
        api.getYouthPlayers(clubId)
      ]);

      set({
        club, squad, fixtures, leagueTable,
        manager, newsFeed, transferOffers, facilities, youthPlayers,
        isLoading: false,
        lastTickDate: new Date().toISOString() // Placeholder for simulation date
      });
    } catch (error) {
      console.error("Tick failed:", error);
      set({ isLoading: false });
    }
  },

  refreshNews: async () => {
    set({ isLoading: true });
    try {
      const newsFeed = await api.getNewsFeed(20);
      set({ newsFeed, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  refreshTransfers: async () => {
    const clubId = get().playerClubId;
    if (!clubId) return;
    set({ isLoading: true });
    try {
      const transferOffers = await api.getTransferOffers(clubId);
      set({ transferOffers, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));
