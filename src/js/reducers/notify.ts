import { combineReducers } from 'redux';
import { ActionType, getType } from 'typesafe-actions';
import * as actions from '../actions';
type Action = ActionType<typeof actions>;

export type DialogState = {
  /** ダイアログ表示 */
  show: boolean;
  /** 確認ダイアログか否か */
  confirm: boolean;
  /** ダイアログ種別 */
  type: 'info' | 'warning' | 'error';
  /** 簡潔に表すメッセージ */
  message: string;
  /** テキストボックスとかで表示したい詳細 */
  detail: string;
};

export type NotifyState = {
  status: 'processing' | 'ok' | 'error';
  /** 通知欄 */
  notify: {
    /** 表示可否 */
    show: boolean;
    /** 色 */
    type: 'info' | 'warning' | 'error';
    /** メッセージ */
    message: string;
    /** 手動で閉じられるか */
    closable: boolean;
  };
  /** ダイアログ */
  dialog: DialogState;
};

export const initial: NotifyState = {
  status: 'processing',
  // 通知欄
  notify: {
    show: false,
    type: 'info',
    message: '',
    closable: true,
  },
  dialog: {
    show: false,
    confirm: false,
    type: 'info',
    message: '',
    detail: '',
  },
};

const reducer = (state: NotifyState = initial, action: Action): NotifyState => {
  switch (action.type) {
    case getType(actions.updateStatus): {
      return { ...state, status: action.payload };
    }

    case getType(actions.changeNotify): {
      return { ...state, notify: { ...action.payload } };
    }
    case getType(actions.closeNotify): {
      return { ...state, notify: { ...state.notify, show: false } };
    }
    case getType(actions.changeDialog): {
      if (action.payload.show === false) {
        return { ...state, dialog: initial.dialog };
      } else {
        return { ...state, dialog: { ...state.dialog, ...action.payload } };
      }
    }
    case getType(actions.closeDialog): {
      return { ...state, dialog: { ...initial.dialog } };
    }

    default:
      return state;
  }
};

export default reducer;
