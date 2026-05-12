import {
  ClubInfo, Player, Fixture, LeagueRow, Manager,
  TransferOffer, MatchReport, NewsEvent, ClubHistory,
  Facilities, YouthPlayer
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

export const getFacilities = (clubId: number) =>
  sendCommand<Facilities>({ type: 'GET_FACILITIES', payload: { club_id: clubId } });

export const getYouthPlayers = (clubId: number) =>
  sendCommand<YouthPlayer[]>({ type: 'GET_YOUTH', payload: { club_id: clubId } });

export const nextTick = () =>
  sendCommand<void>({ type: 'NEXT_TICK' });

export const respondToOffer = (offerId: number, accept: boolean) =>
  sendCommand<void>({ type: 'RESPOND_TO_OFFER', payload: { offer_id: offerId, accept } });

export const upgradeFacility = (clubId: number, type: 'training' | 'medical' | 'youth') =>
  sendCommand<void>({ type: 'UPGRADE_FACILITY', payload: { club_id: clubId, type } });
