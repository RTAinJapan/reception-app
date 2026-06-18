import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import customTheme from '../theme';
import { Theme } from '@mui/material';
import { Accepted, Visitor } from '../types/global';

export type ContentState = {
  config: {
    api: {
      accepted: string;
      visitor: string;
      badgeholder: string;
      /** APIトークン */
      token: string;
    };
    /** Discordの設定 */
    discord: {
      enable: boolean;
      config: {
        baseUrl: string;
        clientId: string;
        redirectUrl: string;
        scope: string;
      };
      /** サーバID */
      guild: string;
      /** この画面を操作できるユーザID。 */
      users: string[];
    };
  };

  /** 全入場者リスト */
  visitorList: Visitor[];
  /** 入場済み（サーバ確定分 ＋ 未送信の保留分を含む表示用の集合） */
  acceptedList: Accepted[];
  /** 通信不能で未送信の受付。疎通回復時に再送する（localStorageに永続化される） */
  pendingAccepts: Accepted[];
  /** 人間単位で入場した人たち */
  acceptedIdentifierList: string[];
  theme: {
    mode: 'light' | 'dark';
    theme: Theme;
  };

  discord: {
    username: string | null;
    token: string | null;
  };

  reader: {
    timer: number;
  };

  displaySetting: {
    readerDeviceId: string;
    /** 低スペック端末向けの軽量モード（解像度・走査頻度を下げる） */
    lowSpecMode: boolean;
  };
};

export const initial: ContentState = {
  config: {
    api: {
      accepted: '',
      visitor: '',
      badgeholder: '',
      token: '',
    },
    discord: {
      enable: true,
      config: {
        baseUrl: '',
        clientId: '',
        redirectUrl: '',
        scope: '',
      },
      guild: '',
      users: [],
    },
  },
  visitorList: [],
  acceptedList: [],
  pendingAccepts: [],
  acceptedIdentifierList: [],
  theme: {
    mode: 'light',
    theme: customTheme('light'),
  },
  discord: {
    username: null,
    token: null,
  },
  reader: {
    timer: 0,
  },
  displaySetting: {
    readerDeviceId: '',
    lowSpecMode: false,
  },
};

/** code をキーに重複を排除する（先に現れたものを優先＝サーバ確定分を優先） */
const dedupeByCode = (list: Accepted[]): Accepted[] => {
  const seen = new Set<string>();
  const result: Accepted[] = [];
  for (const item of list) {
    if (!seen.has(item.code)) {
      seen.add(item.code);
      result.push(item);
    }
  }
  return result;
};

/** 入場済みコードから、入場経験のある identifier 一覧を算出する */
const computeAcceptedIdentifiers = (visitorList: Visitor[], acceptedList: Accepted[]): string[] => {
  const acceptedCodes = acceptedList.map((item) => item.code);
  const list: string[] = [];
  for (const visitor of visitorList) {
    if (acceptedCodes.includes(visitor.code) && !list.includes(visitor.identifier)) {
      list.push(visitor.identifier);
    }
  }
  return list;
};

const contentSlice = createSlice({
  name: 'content',
  initialState: initial,
  reducers: {
    updateTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = { mode: action.payload, theme: customTheme(action.payload) };
    },
    updateConfig(state, action: PayloadAction<ContentState['config']>) {
      state.config = action.payload;
    },
    storeDiscordUserName(state, action: PayloadAction<string | null>) {
      state.discord.username = action.payload;
    },
    updateReaderDevice(state, action: PayloadAction<string>) {
      state.displaySetting.readerDeviceId = action.payload;
    },
    updateLowSpecMode(state, action: PayloadAction<boolean>) {
      state.displaySetting.lowSpecMode = action.payload;
    },
    updateVisitorList(state, action: PayloadAction<Visitor[]>) {
      state.visitorList = action.payload;
    },
    updateAcceptedList(state, action: PayloadAction<Accepted[]>) {
      // サーバの最新スナップショットに、未送信の保留分を重ねて表示用集合とする
      const merged = dedupeByCode([...action.payload, ...current(state.pendingAccepts)]);
      state.acceptedList = merged;
      state.acceptedIdentifierList = computeAcceptedIdentifiers(current(state.visitorList), merged);
    },
    enqueuePendingAccept(state, action: PayloadAction<Accepted>) {
      // 保留キューへ積みつつ、ローカルでは即「入場済み」として扱う（オフライン継続）
      const pendingAccepts = dedupeByCode([...current(state.pendingAccepts), action.payload]);
      const acceptedList = dedupeByCode([...current(state.acceptedList), action.payload]);
      state.pendingAccepts = pendingAccepts;
      state.acceptedList = acceptedList;
      state.acceptedIdentifierList = computeAcceptedIdentifiers(current(state.visitorList), acceptedList);
    },
    setPendingAccepts(state, action: PayloadAction<Accepted[]>) {
      state.pendingAccepts = action.payload;
    },
  },
});

export const {
  updateTheme,
  updateConfig,
  storeDiscordUserName,
  updateReaderDevice,
  updateLowSpecMode,
  updateVisitorList,
  updateAcceptedList,
  enqueuePendingAccept,
  setPendingAccepts,
} = contentSlice.actions;
export default contentSlice.reducer;
