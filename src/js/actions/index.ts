import { createAction } from '@reduxjs/toolkit';

// state を変更するアクションは各 slice(createSlice) が定義する。
// ここで同名で再エクスポートし、従来の `import * as actions from '../actions'` のまま使えるようにする。
export { updateStatus, changeNotify, closeNotify, changeDialog, closeDialog } from '../reducers/notify';
export {
  updateTheme,
  updateConfig,
  storeDiscordUserName,
  updateReaderDevice,
  updateLowSpecMode,
  updateVisitorList,
  updateAcceptedList,
  enqueuePendingAccept,
  setPendingAccepts,
} from '../reducers/content';

// saga が消費するコマンド系アクション（reducer は持たず副作用のトリガーになるだけ）
export const dialogYes = createAction<any>('DIALOG_YES');
export const dialogNo = createAction<any>('DIALOG_NO');

/** 入場者リストの再取得をトリガーする */
export const fetchVisitorList = createAction('FETCH_VISITOR_LIST');

/** 読み取った受付情報の登録をトリガーする */
export const callPostReception = createAction<{ name: string; category: string; code: string }>('CALL_POST_RECEPTION');

/** 保留中の受付の再送をトリガーする */
export const flushPendingAccepts = createAction('FLUSH_PENDING_ACCEPTS');

/** Discord ログインをトリガーする */
export const loginDiscord = createAction('LOGIN_DISCORD');

/** Discord ログアウトをトリガーする */
export const logoutDiscord = createAction('LOGOUT_DISCORD');
