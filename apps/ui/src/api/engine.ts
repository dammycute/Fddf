import {
  ClubInfo, Player, Fixture, LeagueRow, Manager,
  TransferOffer, MatchReport, NewsEvent, ClubHistory,
  Facilities, YouthPlayer, FanSentiment
} from '../types';

export interface GameCommand {
  type: string;
  payload?: unknown;
}

export interface GameResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
  request_id?: string;
}

// ── Global response dispatcher to avoid memory leaks ──
type ResponseCallback = (res: GameResponse) => void;
const pendingCallbacks = new Map<string, ResponseCallback>();

// Initialize the global listener once
if (typeof window !== 'undefined' && window.api) {
  window.api.onResponse((res: GameResponse) => {
    if (res.request_id && pendingCallbacks.has(res.request_id)) {
      const cb = pendingCallbacks.get(res.request_id)!;
      pendingCallbacks.delete(res.request_id);
      cb(res);
    }
  });
} else if (typeof window !== 'undefined') {
  // Mock for browser-only verification
  (window as any).api = {
    command: (cmd: any) => {
      console.log('Mock API Command:', cmd);
      // Simulate async response
      setTimeout(() => {
        let data: any = {};
        if (cmd.type === 'GET_CLUB') data = { name: 'Mock FC', balance: 50000000 };
        if (cmd.type === 'GET_SQUAD') data = [];
        if (cmd.type === 'GET_FIXTURES') data = [];
        if (cmd.type === 'GET_LEAGUE_TABLE') data = [];
        if (cmd.type === 'GET_MANAGER_INFO') data = { name: 'Mock Manager', morale: 80 };
        if (cmd.type === 'GET_TRANSFER_OFFERS') data = [];
        if (cmd.type === 'GET_NEWS_FEED') data = [];
        if (cmd.type === 'GET_FACILITIES') data = { training_level: 3, medical_level: 3, youth_level: 3 };
        if (cmd.type === 'GET_YOUTH') data = [];

        const res: GameResponse = { ok: true, data, request_id: cmd.request_id };
        // We need to trigger the callback registered in onResponse
        // In this simple mock, we'll just use a global ref
        if ((window as any).__api_cb) (window as any).__api_cb(res);
      }, 100);
    },
    onResponse: (cb: any) => {
      (window as any).__api_cb = cb;
    }
  };
}

function sendCommand<T = unknown>(cmd: GameCommand): Promise<T> {
  const requestId = Math.random().toString(36).slice(2);
  const cmdWithId = { ...cmd, request_id: requestId };

  return new Promise<T>((resolve, reject) => {
    pendingCallbacks.set(requestId, (res: GameResponse) => {
      if (!res.ok) {
        reject(new Error(res.error ?? 'Unknown engine error'));
      } else {
        resolve(res.data as T);
      }
    });

    window.api.command(cmdWithId);
  });
}

export const getClub = (clubId: number) =>
  sendCommand<ClubInfo>({ type: 'GET_CLUB', payload: { club_id: clubId } });

export const getSquad = (clubId: number) =>
  sendCommand<Player[]>({ type: 'GET_SQUAD', payload: { club_id: clubId } });

export const getFixtures = (clubId: number) =>
  sendCommand<Fixture[]>({ type: 'GET_FIXTURES', payload: { club_id: clubId } });

export const getLeagueTable = (leagueId: number) =>
  sendCommand<LeagueRow[]>({ type: 'GET_LEAGUE_TABLE', payload: { league_id: leagueId } });

export const getManagerInfo = (clubId: number) =>
  sendCommand<Manager>({ type: 'GET_MANAGER_INFO', payload: { club_id: clubId } });

export const getTransferOffers = (clubId: number) =>
  sendCommand<TransferOffer[]>({ type: 'GET_TRANSFER_OFFERS', payload: { club_id: clubId } });

export const getMatchReport = (fixtureId: number) =>
  sendCommand<MatchReport>({ type: 'GET_MATCH_REPORT', payload: { fixture_id: fixtureId } });

export const getNewsFeed = (limit?: number) =>
  sendCommand<NewsEvent[]>({ type: 'GET_NEWS_FEED', payload: { limit } });

export const getClubHistory = (clubId: number) =>
  sendCommand<ClubHistory[]>({ type: 'GET_CLUB_HISTORY', payload: { club_id: clubId } });

export const getFinancials = (clubId: number) =>
  sendCommand<{ records: any[], sponsorships: any[] }>({ type: 'GET_FINANCIALS', payload: { club_id: clubId } });

export const getFacilities = (clubId: number) =>
  sendCommand<Facilities>({ type: 'GET_FACILITIES', payload: { club_id: clubId } });

export const getYouthPlayers = (clubId: number) =>
  sendCommand<YouthPlayer[]>({ type: 'GET_YOUTH', payload: { club_id: clubId } });

export const nextTick = () =>
  sendCommand<void>({ type: 'NEXT_TICK' });

export const respondToOffer = (offerId: number, accept: boolean) =>
  sendCommand<void>({ type: 'RESPOND_TO_OFFER', payload: { offer_id: offerId, accept } });

export const listPlayer = (playerId: number, fee: number) =>
  sendCommand<void>({ type: 'LIST_PLAYER', payload: { player_id: playerId, fee } });

export const upgradeFacility = (clubId: number, type: 'training' | 'medical' | 'youth') =>
  sendCommand<void>({ type: 'UPGRADE_FACILITY', payload: { club_id: clubId, type } });

export const getFanSentiment = (clubId: number) =>
  sendCommand<FanSentiment>({ type: 'GET_FAN_SENTIMENT', payload: { club_id: clubId } });
