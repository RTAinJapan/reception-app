import { action, createAction } from 'typesafe-actions';
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
export const updateStatus = createAction(UPDATE_STATUS, (action) => {
  return (status: RootState['notify']['status']) => action(status);
});

/** 通知欄表示 */
export const changeNotify = createAction(OPEN_NOTIFY, (action) => {
  return (show: boolean, type: 'info' | 'warning' | 'error', message: string, closable?: boolean) => action({ show, type, message, closable: closable === false ? false : true });
});
/** 通知欄閉じる */
export const closeNotify = createAction(CLOSE_NOTIFY);

/** ダイアログ表示 */
export const changeDialog = createAction(OPEN_DIALOG, (action) => {
  return (args: Partial<DialogState>) => action(args);
});
/** ダイアログ閉じる */
export const closeDialog = createAction(CLOSE_DIALOG);

export const dialogYes = createAction(DIALOG_YES, (action) => {
  return (args: any) => action(args);
});
export const dialogNo = createAction(DIALOG_NO, (action) => {
  return (args: any) => action(args);
});

// テーマ設定
const UPDATE_THEME = 'UPDATE_THEME';
export const updateTheme = createAction(UPDATE_THEME, (action) => {
  return (mode: 'light' | 'dark') => action(mode);
});

const UPDATE_CONFIG = 'UPDATE_CONFIG';
export const updateConfig = createAction(UPDATE_CONFIG, (action) => {
  return (config: RootState['content']['config']) => action(config);
});

// コードリーダーのデバイスを変更
const UPDATE_READER_DEVICE = 'UPDATE_READER_DEVICE';
/** コードリーダーのデバイスIDを選択 */
export const updateReaderDevice = createAction(UPDATE_READER_DEVICE, (action) => {
  return (deviceId: string) => action(deviceId);
});

const UPDATE_VISITOR_LIST = 'UPDATE_VISITOR_LIST';
export const updateVisitorList = createAction(UPDATE_VISITOR_LIST, (action) => {
  return (list: Visitor[]) => action(list);
});

const CALL_UPDATE_ACCEPTED_LIST = 'CALL_UPDATE_ACCEPTED_LIST';
export const callPostReception = createAction(CALL_UPDATE_ACCEPTED_LIST, (action) => {
  return (obj: { name: string; category: string; code: string }) => action(obj);
});

const UPDATE_ACCEPTED_LIST = 'UPDATE_ACCEPTED_LIST';
export const updateAcceptedList = createAction(UPDATE_ACCEPTED_LIST, (action) => {
  return (list: Accepted[]) => action(list);
});
