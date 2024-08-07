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
  /** 入場済み */
  acceptedList: Accepted[];
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
  },
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

    case getType(actions.updateVisitorList): {
      return {
        ...state,
        visitorList: action.payload,
      };
    }

    case getType(actions.updateAcceptedList): {
      const list: string[] = [];
      const acceptedList = action.payload.map((item) => item.code);
      for (const visitor of state.visitorList) {
        if (acceptedList.includes(visitor.code) && !list.includes(visitor.identifier)) {
          list.push(visitor.identifier);
        }
      }

      return {
        ...state,
        acceptedList: action.payload,
        acceptedIdentifierList: list,
      };
    }

    default:
      return state;
  }
};

export default reducer;
