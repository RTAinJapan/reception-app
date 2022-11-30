/* eslint-disable @typescript-eslint/ban-types */
import { Visitor } from '../types/global';
import { Color } from './Color';

/**
 * JSONの取得
 * @param url 取得先のURL
 * @return JSONオブジェクト
 * @throws 通信エラー
 * @throws JSON変換エラー
 */
export const fetchJson = async <T>(url: string): Promise<T> => {
  try {
    const result = await fetch(url, { cache: 'no-store' });
    const config = await result.json();
    return config as T;
  } catch (e) {
    console.error(e);
    throw new Error(`通信エラーが発生しました。 ${e.message}`);
  }
};

export const postJson = async <T>(url: string, body: object): Promise<T> => {
  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return (await result.json()) as T;
  } catch (e) {
    console.error(e);
    throw new Error(`通信エラーが発生しました。 ${e.message}`);
  }
};

export const postFile = async <T>(url: string, file: File): Promise<T> => {
  try {
    const formData = new FormData();
    formData.append(file.name, file);

    const result = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return (await result.json()) as T;
  } catch (e) {
    console.error(e);
    throw new Error(`通信エラーが発生しました。 ${e.message}`);
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

export const typeToStr = (visitor?: Visitor['type']) => {
  if (!visitor) return '';
  switch (visitor) {
    case 'runner':
      return '走者';
    case 'commentator':
      return '解説';
    case 'volunteer':
      return 'ボランティア';
    case 'visitor':
      return '観客';
    default:
      return 'その他';
  }
};

export const converDate = (timeStr: string) => {
  if (!timeStr) return '';

  const date = new Date(timeStr);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mm = date.getMinutes();
  const s = date.getSeconds();

  return `${y}/${m}/${d} ${h}:${mm}:${s}`;
};
