export const MELA_SESSION_LENGTH = 25; // minutes
export const MELA_BREAK_LENGTH = 5;
export const MELA_LONG_BREAK_LENGTH = 15;

export const P_UNCOMMON = 0.2;
export const P_RARE = 0.15;
export const P_SUPERRARE = 0.1;
export const P_MYTHICAL = 0.05;

export enum SessionType {
  Mela = 'mela',
  Break = 'break',
  LongBreak = 'long-break'
}

export enum MelaType {
  Common = 'red-apple',
  Uncommon = 'green-apple',
  Rare = 'rare-apple',
  SuperRare = 'super-rare-apple',
  Mythical = 'mythic-apple'
}

export const MelaKeys: string[] = Object.values(MelaType);

export interface IPlaylist {
  sessions: ISession[];
}

export interface ISession {
  type: SessionType;
  mela: MelaType;
  name: string;
  totalDuration: number; // in minutes
}

export class Session implements ISession {
  public readonly mela: MelaType;
  public readonly totalDuration: number;

  static getDurationByType(type: SessionType) {
    switch (type) {
      case SessionType.Mela:
        return MELA_SESSION_LENGTH;
      case SessionType.Break:
        return MELA_BREAK_LENGTH;
      case SessionType.LongBreak:
        return MELA_LONG_BREAK_LENGTH;
      default:
        throw new Error('Unsupported session type');
    }
  }

  constructor(public name: string, public type = SessionType.Mela) {
    this.mela = this.selectMela();
    this.totalDuration = Session.getDurationByType(type);
  }

  private selectMela(): MelaType {
    const p = Math.random();
    if (p < P_MYTHICAL) return MelaType.Mythical;
    if (p < P_SUPERRARE) return MelaType.SuperRare;
    if (p < P_RARE) return MelaType.Rare;
    if (p < P_UNCOMMON) return MelaType.Uncommon;
    return MelaType.Common;
  }
}

export type RewardsCounter = { [key: string]: number };
