export interface ClubInfo {
  id: number;
  name: string;
  reputation: number;
  balance: number;
  squad_size: number;
  transfer_budget: number;
  wage_budget: number;
}

export interface Player {
  id: number;
  club_id: number | null;
  name: string;
  age: number;
  nationality: string;
  attributes: Record<string, any>;
  ca: number;
  pa: number;
  fitness: number;
  stamina: number;
  morale: number;
}

export interface Contract {
  id: number;
  player_id: number;
  club_id: number;
  wage: number;
  start_date: string;
  end_date: string;
  release_clause: number | null;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
}

export interface Manager {
  id: number;
  name: string;
  age: number;
  nationality: string;
  tactical_style: Record<string, any>;
  reputation: number;
  preferred_formations: string[];
  man_management: number;
  tactical_knowledge: number;
  youth_development: number;
  ambition: number;
  club_id: number | null;
  morale: number;
  demands: Record<string, any>;
  contract_end?: string; // from getManagerInfo
}

export interface Fixture {
  id: number;
  league_id: number;
  home_club_id: number;
  away_club_id: number;
  home_name: string | null;
  away_name: string | null;
  date: string | null;
  status: string;
  home_goals: number | null;
  away_goals: number | null;
  match_report_id: string | null;
}

export interface LeagueRow {
  club_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface TransferOffer {
  id: number;
  player_id: number;
  player_name?: string;
  from_club_id: number | null;
  from_club_name?: string;
  to_club_id: number | null;
  to_club_name?: string;
  fee: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'LISTED';
  created_date: string;
  resolved_date: string | null;
  installments: number;
  is_loan: boolean;
}

export interface NewsEvent {
  id: number;
  title: string;
  content: string;
  date: string;
  importance: number;
}

export interface ClubHistory {
  id: number;
  club_id: number;
  season: number;
  achievement: string;
  data: Record<string, any>;
}

export interface MatchReport {
  fixture: {
    id: number;
    date: string;
    home_name: string;
    away_name: string;
    home_goals: number;
    away_goals: number;
  };
  report: {
    home_possession: number;
    away_possession: number;
    home_shots: number;
    away_shots: number;
    events: any[];
  };
}

export interface FanSentiment {
  club_id: number;
  rating: number; // 0-100
  expectation: string;
}

export interface Facilities {
  id: number;
  club_id: number;
  training_level: number;
  medical_level: number;
  youth_level: number;
  training_upgrade_cost: number;
  medical_upgrade_cost: number;
  youth_upgrade_cost: number;
  upgrade_in_progress: Record<string, any> | null;
}

export interface YouthPlayer {
  id: number;
  club_id: number;
  name: string;
  age: number;
  nationality: string;
  position: string;
  pa: number;
  personality_id: number | null;
  intake_season: number;
  promoted: boolean;
}

export interface ScoutReport {
  id: number;
  player_id: number;
  scout_id: number;
  club_id: number;
  created_date: string;
  ca_estimate: number;
  pa_estimate: number;
  notes: string;
  attributes_snapshot: Record<string, any>;
}

export interface Season {
  id: number;
  league_id: number;
  season_number: number;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'COMPLETED';
  champion_club_id: number | null;
}
