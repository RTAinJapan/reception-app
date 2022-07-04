import React, { useRef, useEffect } from 'react';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';

export interface ReactQRCodeProps {
  text?: string;
  data?: number[];
  title?: string;
  options?: QRCodeRenderersOptions;
  tagType?: 'canvas' | 'img';
}

export interface ReactQRCodeColors {
  dark?: string;
  light?: string;
}

function useQRCode({ ...props }: ReactQRCodeProps) {
  const inputRef = useRef();
  const { text, data } = props;

  const [dataUrl, setDataUrl] = React.useState('');

  const options: QRCodeRenderersOptions = {
    ...props.options,
  };

  const tagType = props.tagType ?? 'canvas';

  if (tagType === 'canvas') {
    useEffect(
      function () {
        if (inputRef) {
          const ref = inputRef as any;
          if (ref.current.tagName === 'CANVAS') {
            if (text) {
              // テキストモード
              QRCode.toCanvas(ref.current, text, options, function (error: any) {
                if (error) {
                  throw error;
                }
              });
            } else if (data) {
              // Byteモード
              QRCode.toCanvas(ref.current, [{ data: new Uint8ClampedArray(data), mode: 'byte' }], options, function (error: any) {
                if (error) {
                  throw error;
                }
              });
            }
          }
        }
      },
      [text, options],
    );

    return { inputRef, dataUrl };
  } else {
    useEffect(function () {
      if (text) {
        // テキストモード
        QRCode.toDataURL(text, options, function (error: any, url: string) {
          setDataUrl(url);
          if (error) {
            throw error;
          }
        });
      } else if (data) {
        // Byteモード
        QRCode.toDataURL([{ data: new Uint8ClampedArray(data), mode: 'byte' }], options, function (error: any, url: string) {
          setDataUrl(url);
          if (error) {
            throw error;
          }
        });
      }
    }, []);

    return { inputRef, dataUrl };
  }
}

function App(props: ReactQRCodeProps): JSX.Element {
  if (!props.data || props.data.length === 0) return <div />;

  const ret = useQRCode({
    text: props.text,
    data: props.data,
    options: props.options,
    tagType: props.tagType,
  });
  if (props.tagType === 'img') {
    return <img src={(ret as any).dataUrl} />;
  } else {
    return <canvas ref={(ret as any).inputRef as any} />;
  }
}

export default App;
