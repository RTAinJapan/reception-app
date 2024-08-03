import { QRCodeRenderersOptions } from 'qrcode';
import React from 'react';

/** バイナリの16進数文字列をバイト列にする */
export const binStrToByte = (str: string): number[] => {
  // 2文字ずつ
  const list: string[] = [];
  let buf = '';
  for (let i = 1; i <= str.length; i++) {
    if (i % 2 === 0) {
      list.push(`${buf}${str[i - 1]}`);
      buf = '';
    } else {
      buf = str[i - 1];
    }
  }

  const result: number[] = [];
  for (let i = 0; i < list.length; i++) {
    result.push(parseInt(list[i], 16));
  }

  return result;
};

export type ReactQRCodeProps = {
  text?: string;
  data?: number[];
  title: string;
  thumbnail: string;
  background: string;
  backgroundRotate: boolean;
  options?: QRCodeRenderersOptions;
  tagType?: 'canvas' | 'img';
};

export function useDelayedEffect(effect: React.EffectCallback, deps: React.DependencyList, timeout = 1000) {
  React.useEffect(() => {
    const timeoutId = setTimeout(effect, timeout);

    return () => clearTimeout(timeoutId);
  }, deps);
}

/** Jsonファイルを取得 */
export async function fetchJson<T>(url: string): Promise<T> {
  const result = await fetch(url);
  const json = await result.json();
  return json as T;
}

/**
 * QRコードの認識停止
 */
export const stopRecogQR = () => {
  try {
    if(!window.codeReaderTimer) return;
    console.log(`stopRecogQR id=${window.codeReaderTimer}`);
    clearInterval(window.codeReaderTimer);
    const dom = (document.querySelector('video')!.srcObject as MediaStream)?.getVideoTracks();
    if(dom) {
      dom[0].stop();
    } else {
      console.warn("video tracksの取得に失敗");
    }
  } catch (e) {
    // ビデオがまだ無いときとかにここに来るが、気にしない
    console.warn(e);
  }
};

export const yyyymmdd = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = `00${date.getMonth() + 1}`.slice(-2);
  const day = `00${date.getDate()}`.slice(-2);
  return `${year}/${month}/${day}`;
};

export const isNew = (dateStr: string) => {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setDate(today.getDate() - 3);
  today.setHours(0, 0, 0, 0);
  return target.getTime() - today.getTime() > 0;
};
