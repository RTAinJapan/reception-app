import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  status: 'initialize' | 'processing' | 'ok' | 'error';
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
  status: 'initialize',
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

const notifySlice = createSlice({
  name: 'notify',
  initialState: initial,
  reducers: {
    updateStatus(state, action: PayloadAction<NotifyState['status']>) {
      console.log(`updateStatus: ${action.payload}`);
      state.status = action.payload;
    },
    /** 通知欄表示。複数引数を受け取るため prepare でペイロードを組み立てる */
    changeNotify: {
      reducer(state, action: PayloadAction<NotifyState['notify']>) {
        state.notify = action.payload;
      },
      prepare(show: boolean, type: 'info' | 'warning' | 'error', message: string, closable?: boolean) {
        return { payload: { show, type, message, closable: closable === false ? false : true } };
      },
    },
    /** 通知欄を閉じる */
    closeNotify(state) {
      state.notify.show = false;
    },
    /** ダイアログ表示／更新 */
    changeDialog(state, action: PayloadAction<Partial<DialogState>>) {
      if (action.payload.show === false) {
        state.dialog = { ...initial.dialog };
      } else {
        state.dialog = { ...state.dialog, ...action.payload };
      }
    },
    /** ダイアログを閉じる */
    closeDialog(state) {
      state.dialog = { ...initial.dialog };
    },
  },
});

export const { updateStatus, changeNotify, closeNotify, changeDialog, closeDialog } = notifySlice.actions;
export default notifySlice.reducer;
