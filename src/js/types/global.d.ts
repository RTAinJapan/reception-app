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

  /** 人間を識別する文字列 */
  identifier: string;
};

export type Accepted = {
  name: string;
  code: string;
  accepted: string;
  timestamp: string;
};
