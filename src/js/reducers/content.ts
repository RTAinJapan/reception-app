import { ActionType, getType } from 'typesafe-actions';
import * as actions from '../actions';
import customTheme from '../theme';
import { Theme } from '@mui/material';
import { Visitor } from '../types/global';
type Action = ActionType<typeof actions>;

export type ContentState = {
  /** 入場者リスト */
  visitorList: Visitor[];
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
  visitorList: [],
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

    default:
      return state;
  }
};

export default reducer;
