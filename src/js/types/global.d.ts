declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

export type ArrayItem<T extends any[]> = T extends (infer Titem)[] ? Titem : never;
export type ResolvedType<T> = T extends Promise<infer R> ? R : T;
export type GeneratorType<T extends (...args: any) => any> = ResolvedType<ReturnType<T>>;

export type CommonResponse<T> =
  | {
      status: 'ok';
      data: T;
    }
  | {
      status: 'ng';
      data: string;
    };

export type Visitor = {
  /** 連番 */
  id: string;
  /** 名前 */
  name: string;
  /** 入場者区分 */
  category: string;
  /** コードの有効期限  start */
  start_at: string;
  /** コードの有効期限 end */
  end_at: string;
  /**
   * 入場コード
   * @example '11958fb1b6f950444d850b8e4d55447400'
   */
  code: string;
  /** ユーザを識別する情報 */
  identifier: string;
  /** 日毎に入場処理を必要とする者かどうか。 */
  isDailyAccept: boolean;
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
  /**
   * 入場者種別
   * @example '走者'
   * @example '観客 12月25日'
   */
  category: string;
  /**
   * 受付時刻
   * @example "2022-08-11T00:18:15.906Z"
   */
  timestamp: string;
};
