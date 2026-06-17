import { createAction } from 'typesafe-actions';
import { RootState } from '../reducers';
import { DialogState } from '../reducers/notify';
import { Accepted, Visitor } from '../types/global';

const OPEN_NOTIFY = 'OPEN_NOTIFY';
const CLOSE_NOTIFY = 'CLOSE_NOTIFY';
const OPEN_DIALOG = 'OPEN_DIALOG';
const CLOSE_DIALOG = 'CLOSE_DIALOG';

const DIALOG_YES = 'DIALOG_YES';
const DIALOG_NO = 'DIALOG_NO';

const UPDATE_STATUS = 'UPDATE_STATUS';
export const updateStatus = createAction(UPDATE_STATUS, (status: RootState['notify']['status']) => status)();

/** 通知欄表示 */
export const changeNotify = createAction(OPEN_NOTIFY, (show: boolean, type: 'info' | 'warning' | 'error', message: string, closable?: boolean) => ({
  show,
  type,
  message,
  closable: closable === false ? false : true,
}))();
/** 通知欄閉じる */
export const closeNotify = createAction(CLOSE_NOTIFY)();

/** ダイアログ表示 */
export const changeDialog = createAction(OPEN_DIALOG, (args: Partial<DialogState>) => args)();
/** ダイアログ閉じる */
export const closeDialog = createAction(CLOSE_DIALOG)();

export const dialogYes = createAction(DIALOG_YES, (args: any) => args)();
export const dialogNo = createAction(DIALOG_NO, (args: any) => args)();

// テーマ設定
const UPDATE_THEME = 'UPDATE_THEME';
export const updateTheme = createAction(UPDATE_THEME, (mode: 'light' | 'dark') => mode)();

const UPDATE_CONFIG = 'UPDATE_CONFIG';
export const updateConfig = createAction(UPDATE_CONFIG, (config: RootState['content']['config']) => config)();

// コードリーダーのデバイスを変更
const UPDATE_READER_DEVICE = 'UPDATE_READER_DEVICE';
/** コードリーダーのデバイスIDを選択 */
export const updateReaderDevice = createAction(UPDATE_READER_DEVICE, (deviceId: string) => deviceId)();

// 低スペック端末向けの軽量モード
const UPDATE_LOW_SPEC_MODE = 'UPDATE_LOW_SPEC_MODE';
/** 軽量モードの ON/OFF を切り替える */
export const updateLowSpecMode = createAction(UPDATE_LOW_SPEC_MODE, (enabled: boolean) => enabled)();

const FETCH_VISITOR_LIST = 'FETCH_VISITOR_LIST';
export const fetchVisitorList = createAction(FETCH_VISITOR_LIST)();

const UPDATE_VISITOR_LIST = 'UPDATE_VISITOR_LIST';
export const updateVisitorList = createAction(UPDATE_VISITOR_LIST, (list: Visitor[]) => list)();

const CALL_UPDATE_ACCEPTED_LIST = 'CALL_UPDATE_ACCEPTED_LIST';
export const callPostReception = createAction(CALL_UPDATE_ACCEPTED_LIST, (obj: { name: string; category: string; code: string }) => obj)();

const UPDATE_ACCEPTED_LIST = 'UPDATE_ACCEPTED_LIST';
export const updateAcceptedList = createAction(UPDATE_ACCEPTED_LIST, (list: Accepted[]) => list)();

const ENQUEUE_PENDING_ACCEPT = 'ENQUEUE_PENDING_ACCEPT';
/** オフライン時に受付を保留キューへ積む（楽観的にローカルの入場済みへも反映する） */
export const enqueuePendingAccept = createAction(ENQUEUE_PENDING_ACCEPT, (item: Accepted) => item)();

const SET_PENDING_ACCEPTS = 'SET_PENDING_ACCEPTS';
/** 保留キューを置き換える（再送後の残件反映に使用） */
export const setPendingAccepts = createAction(SET_PENDING_ACCEPTS, (list: Accepted[]) => list)();

const FLUSH_PENDING_ACCEPTS = 'FLUSH_PENDING_ACCEPTS';
/** 保留キューの再送を試みる（疎通回復時・手動更新時など） */
export const flushPendingAccepts = createAction(FLUSH_PENDING_ACCEPTS)();

// Discord
const LOGIN_DISCORD = 'LOGIN_DISCORD';
/** ログインする */
export const loginDiscord = createAction(LOGIN_DISCORD)();

const LOGOUT_DISCORD = 'LOGOUT_DISCORD';
/** ログアウトする */
export const logoutDiscord = createAction(LOGOUT_DISCORD)();

const STORE_DISCORD_USER_NAME = 'STORE_DISCORD_USER_NAME';
/** Discordのユーザ名を格納 */
export const storeDiscordUserName = createAction(STORE_DISCORD_USER_NAME, (username: string | null) => username)();
