import { ActionType, getType } from 'typesafe-actions';
import * as actions from '../actions';
import customTheme from '../theme';
import { Theme } from '@mui/material';
import { Accepted, Visitor } from '../types/global';
type Action = ActionType<typeof actions>;

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

const reducer = (state: ContentState = initial, action: Action): ContentState => {
  switch (action.type) {
    case getType(actions.updateTheme): {
      return {
        ...state,
        theme: {
          mode: action.payload,
          theme: customTheme(action.payload),
        },
      };
    }

    case getType(actions.updateConfig): {
      return {
        ...state,
        config: action.payload,
      };
    }

    case getType(actions.storeDiscordUserName): {
      return {
        ...state,
        discord: {
          ...state.discord,
          username: action.payload,
        },
      };
    }

    case getType(actions.updateReaderDevice): {
      return {
        ...state,
        displaySetting: {
          ...state.displaySetting,
          readerDeviceId: action.payload,
        },
      };
    }

    case getType(actions.updateLowSpecMode): {
      return {
        ...state,
        displaySetting: {
          ...state.displaySetting,
          lowSpecMode: action.payload,
        },
      };
    }

    case getType(actions.updateVisitorList): {
      return {
        ...state,
        visitorList: action.payload,
      };
    }

    case getType(actions.updateAcceptedList): {
      // サーバの最新スナップショットに、未送信の保留分を重ねて表示用集合とする
      const merged = dedupeByCode([...action.payload, ...state.pendingAccepts]);
      return {
        ...state,
        acceptedList: merged,
        acceptedIdentifierList: computeAcceptedIdentifiers(state.visitorList, merged),
      };
    }

    case getType(actions.enqueuePendingAccept): {
      // 保留キューへ積みつつ、ローカルでは即「入場済み」として扱う（オフライン継続）
      const pendingAccepts = dedupeByCode([...state.pendingAccepts, action.payload]);
      const acceptedList = dedupeByCode([...state.acceptedList, action.payload]);
      return {
        ...state,
        pendingAccepts,
        acceptedList,
        acceptedIdentifierList: computeAcceptedIdentifiers(state.visitorList, acceptedList),
      };
    }

    case getType(actions.setPendingAccepts): {
      return {
        ...state,
        pendingAccepts: action.payload,
      };
    }

    default:
      return state;
  }
};

export default reducer;
