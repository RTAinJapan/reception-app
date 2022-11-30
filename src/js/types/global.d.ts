declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

export type ArrayItem<T extends any[]> = T extends (infer Titem)[] ? Titem : never;
export type ResolvedType<T> = T extends Promise<infer R> ? R : T;
export type GeneratorType<T extends (...args: any) => any> = ResolvedType<ReturnType<T>>;

export type Visitor = {
  /** 名前 */
  name: string;
  /** 入場者の種別 */
  type: 'runner' | 'commentator' | 'volunteer' | 'visitor';
  /**
   * @example '11958fb1b6f950444d850b8e4d55447400'
   */
  code: string;
  /**
   * Form投稿のタイムスタンプ
   * @example '2022-07-10T13:00:50.830Z'
   */
  timestamp: string;
  /** キャンセルしたか */
  isCancel: boolean;
  /**
   * 入場日
   * @example '2022年8月11日'
   */
  date: string;
  /** ユーザを識別する情報 */
  identifier: string;
};

export type Accepted = {
  /**
   * 名前
   * @example "Rちゃん"
   */
  name: string;
  /**
   * コード
   * @example "1234567890abcd"
   */
  code: string;
  /** 日付 */
  date: string;
  /**
   * 受付時刻
   * @example "2022-08-11T00:18:15.906Z"
   */
  timestamp: string;
};
