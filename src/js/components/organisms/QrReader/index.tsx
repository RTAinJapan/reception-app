import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@mui/styles';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import jsQR from 'jsqr';
import { QRCodeRenderersOptions } from 'qrcode';
import { Button, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { stopRecogQR } from '../../../common/util';
import { Visitor } from '../../../types/global';
import { converDate as convertDate } from '../../../sagas/common';

const useStyles = () =>
  makeStyles({
    root: {
      display: 'flex',
      position: 'relative',
    },
  })();

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const App: React.SFC<PropsType> = (props: PropsType) => {
  const classes = useStyles();

  const [deviceList, setDeviceList] = React.useState<MediaDeviceInfo[]>([]);
  const [renderDeviceId, setDeviceId] = React.useState(props.readerDeviceId);
  const [qrData, setQrData] = React.useState<{ byte: number[]; data: string; version: number } | null>(null);

  useEffect(() => {
    startRecogQr();
  }, []);

  const handleCancelReader = () => {
    setQrData(null);
    startRecogQr(renderDeviceId);
  };

  /** コード承認ボタン */
  const handleConfirmQr = (visitor: Visitor) => () => {
    props.postReception({
      name: visitor.name,
      category: visitor.category,
      code: visitor.code,
    });

    if (!visitor.isDailyAccept) {
      // 同じ人の他のポジションも受付扱いにする
      pickIdentifier(visitor).map((item) => {
        props.postReception({
          name: item.name,
          category: item.category,
          code: item.code,
        });
      });
    }

    // 認識再開
    setQrData(null);
    startRecogQr(renderDeviceId);
  };

  /** identifierを同じくする他の入場者情報（役職違いとか）を抽出。引数指定したやつは返さない */
  const pickIdentifier = (visitor: Visitor): Visitor[] => {
    const result = props.visitorList.filter((item) => item.code !== visitor.code && item.identifier === visitor.identifier);
    console.log(`pickIdentifier=${result.length}`);
    return result;
  };

  /**
   * QRコードの認識開始
   */
  const startRecogQr = async (deviceId = '') => {
    let targetDeviceId = deviceId ? deviceId : renderDeviceId;
    console.log('startRecogQr deviceId=' + targetDeviceId);
    stopRecogQR();

    let devices = await navigator.mediaDevices.enumerateDevices();
    devices = devices.filter((device) => device.kind.includes('videoinput'));
    console.log(devices);
    setDeviceList(devices);

    if (devices.length === 0) {
      console.log('ビデオ入力デバイスが無い');
      alert('カメラ情報が取得できませんでした');
      return;
    }

    if (!devices.find((item) => item.deviceId === targetDeviceId)) {
      console.log(`適切なデバイスが選択されなかった。 targetDeviceId=${targetDeviceId}`);

      // 適当なカメラにfallbackする
      let device = devices.find((item) => item.label.includes('背面'));
      if (device) {
        targetDeviceId = device.deviceId;
      } else {
        device = devices.find((item) => item.label.includes('env'));
        if (device) {
          targetDeviceId = device.deviceId;
        } else {
          targetDeviceId = devices[0].deviceId;
        }
      }
    }

    const aspect =
      window.innerWidth - window.innerHeight > 0
        ? {
            min: 0.5625,
            ideal: 1.5,
            max: 2,
          }
        : {
            min: 0.5625,
            ideal: 0.75,
            max: 2,
          };

    const srcObj = document.querySelector('video')!.srcObject as MediaStream;
    if (srcObj) {
      srcObj.getTracks().map((item) => item.stop());
    }

    // カメラ起動
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        aspectRatio: aspect,
        width: {
          min: 480,
          ideal: 1080,
        },
        height: {
          min: 480,
          ideal: 1080,
        },
        deviceId: targetDeviceId ? targetDeviceId : undefined,
        facingMode: 'environment',
        frameRate: { ideal: 30, max: 60 },
      },
    });

    document.querySelector('video')!.srcObject = mediaStream;
    console.log(`${document.querySelector('video')!.width}  ${document.querySelector('video')!.height}`);

    const video = document.querySelector('video') as HTMLVideoElement;
    const canv = document.createElement('canvas');
    canv.width = 720;
    canv.height = 720;
    const context = canv.getContext('2d') as CanvasRenderingContext2D;

    // 認識処理
    const id = window.setInterval(function () {
      context.drawImage(video, 0, 0, 720, 720);

      const imageData = context.getImageData(0, 0, 720, 720);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.binaryData.length > 0) {
        // 読み取れたら結果出力
        console.log(code);
        if (code.binaryData.length > 0) {
          stopRecogQR();
          setQrData({ byte: code.binaryData, data: code.data, version: code.version });
        }
      }
    }, 50);
    window.codeReaderTimer = id;
  };

  const changeDeviceId = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    props.updateDeviceId(event.target.value);
    setDeviceId(event.target.value);
    startRecogQr(event.target.value);
  };

  const createQrReader = () => {
    return (
      <div style={{ height: '100%' }}>
        <video id="qrReader" autoPlay playsInline={true} className="qr_reader" width={720} height={720}></video>
        <div style={{ position: 'absolute', bottom: 70, width: '90%', margin: '5%' }}>
          <Typography variant={'h6'}>カメラデバイス選択</Typography>
          <Select defaultValue={renderDeviceId} onChange={changeDeviceId} style={{ width: '90%' }}>
            {deviceList.map((item, index) => {
              return (
                <MenuItem key={item.deviceId} value={item.deviceId}>
                  {item.label ? item.label : `デバイス${index}`}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </div>
    );
  };

  const createQrResult = () => {
    const byte = qrData?.byte ?? [];
    const txt = qrData?.data ?? '';
    // const binStr = byte.map((item) => `00${item.toString(16)}`.slice(-2)).join('');
    // const version = qrData?.version ?? 0;
    // const options: QRCodeRenderersOptions = {
    //   errorCorrectionLevel: 'M',
    //   margin: 2,
    //   width: 300,
    // };

    // 読み取ったコードをリストの中から探索
    const visitor = props.visitorList.find((item) => item.code === txt);
    const types: Visitor['category'][] = [];
    let isExpired = false;
    if (visitor) {
      // 入場コードが有効な期限かをチェック
      const now = new Date().getTime();
      if (new Date(visitor.start_at).getTime() <= now && now <= new Date(visitor.end_at).getTime()) {
        console.log('is valid date');
      } else {
        isExpired = true;
      }

      types.push(visitor.category);
      if (!visitor.isDailyAccept) {
        // 他の役職を抽出
        types.push(...pickIdentifier(visitor).map((item) => item.category));
      }
    }

    return (
      <div style={{ textAlign: 'center', height: '100%' }}>
        <div style={{ top: 100, position: 'sticky' }}>
          <div style={{ marginBottom: 50 }}>
            <Typography variant="h3">{visitor ? visitor.name : '未登録者'}</Typography>
          </div>
          {visitor && (
            <>
              {isExpired && (
                <div style={{ marginBottom: 10, color: 'red' }}>
                  <Typography variant="h5">コードが有効期限外です</Typography>
                  <Typography variant="caption">
                    {convertDate(visitor.start_at)}〜{convertDate(visitor.end_at)}
                  </Typography>
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <Typography variant="h5">
                  {types.map((item, index) => (
                    <div key={`key_type_${index}`}>{item}</div>
                  ))}
                </Typography>
              </div>
              <div style={{ marginBottom: 50 }}>
                <Typography variant="h5" style={{ color: 'red' }}>
                  {props.acceptedList.map((item) => item.code).includes(visitor.code) ? '使用済コード' : ''}
                </Typography>
              </div>

              <div style={{ marginBottom: 50 }}>
                <Typography variant="h5">{props.acceptedIdentifier.includes(visitor.identifier) ? '入場経験済' : ''}</Typography>
              </div>
            </>
          )}
        </div>
        {/* ボタン類 */}
        <div style={{ position: 'fixed', bottom: 120, left: '25%' }}>
          {visitor && (
            <Button variant="contained" color="info" onClick={handleConfirmQr(visitor)} style={{ margin: 10 }}>
              承認
            </Button>
          )}
          <Button variant="contained" color="error" onClick={handleCancelReader} style={{ margin: 10 }}>
            キャンセル
          </Button>
        </div>
      </div>
    );
  };

  return <div style={{ height: '100%', padding: 10 }}>{!qrData ? createQrReader() : createQrResult()}</div>;
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    readerDeviceId: state.content.displaySetting.readerDeviceId,
    visitorList: state.content.visitorList,
    acceptedList: state.content.acceptedList,
    acceptedIdentifier: state.content.acceptedIdentifierList,
  };
};

// action
const mapDispatchToProps = {
  updateDeviceId: actions.updateReaderDevice,
  changeNotify: actions.changeNotify,
  postReception: actions.callPostReception,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
