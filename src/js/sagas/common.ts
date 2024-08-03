import { Color } from './Color';

/**
 * JSONの取得
 * @param url 取得先のURL
 * @return JSONオブジェクト
 * @throws 通信エラー
 * @throws JSON変換エラー
 */
export const fetchJson = async <T>(url: string, headers: any = {}): Promise<T> => {
  try {
    const result = await fetch(url, { cache: 'no-store', headers: headers });
    const config = await result.json();
    return config as T;
  } catch (e) {
    console.error(e);
    throw new Error(`通信エラーが発生しました。url=${url} ${e.message}`);
  }
};

export const postJson = async <T>(url: string, body: object, headers: any = {}): Promise<T> => {
  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return (await result.json()) as T;
  } catch (e) {
    console.error(e);
    throw new Error(`通信エラーが発生しました。url=${url} ${e.message}`);
  }
};

/**
 * 色の補色を返す
 * @param color #123456
 * @returns
 */
export const compColor = (baseColor: string) => {
  const color = Color.parse(baseColor);
  color.spin(180);
  return color.cssRGB();
};

/** 日時を表示用に整形 */
export const convertDate = (timeStr: string) => {
  if (!timeStr) return '';

  const date = new Date(timeStr);
  const y = date.getFullYear();
  const m = `00${date.getMonth() + 1}`.slice(-2);
  const d = `00${date.getDate()}`.slice(-2);
  const h = `00${date.getHours()}`.slice(-2);
  const mm = `00${date.getMinutes()}`.slice(-2);
  const s = `00${date.getSeconds()}`.slice(-2);

  return `${y}/${m}/${d} ${h}:${mm}:${s}`;
};
