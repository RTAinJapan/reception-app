import { ActionType, getType } from 'typesafe-actions';
import * as actions from '../actions';
import customTheme from '../theme';
import { Theme } from '@mui/material';
import { Accepted, Visitor } from '../types/global';
type Action = ActionType<typeof actions>;

export type ContentState = {
  config: {
    api: {
      reception: string;
      formKey: {
        name: string;
        date: string;
        code: string;
      };
    };
    /**
     * 日付のリスト
     * @example ["12月26日","12月27日"]
     */
    date: string[];
    data: {
      accepted: string;
      commentator: string;
      guest: string;
      runner: string;
      visitor: string;
      volunteer: string;
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
      reception: '',
      formKey: {
        name: '',
        date: '',
        code: '',
      },
    },
    date: [],
    data: {
      accepted: '',
      commentator: '',
      guest: '',
      runner: '',
      visitor: '',
      volunteer: '',
    },
  },

  visitorList: [],
  acceptedList: [],
  acceptedIdentifierList: [],
  theme: {
    mode: 'light',
    theme: customTheme('light'),
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
