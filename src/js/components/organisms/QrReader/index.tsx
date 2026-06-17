import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import jsQR from 'jsqr';
import { QRCodeRenderersOptions } from 'qrcode';
import { Button, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { stopRecogQR } from '../../../common/util';
import { Visitor } from '../../../types/global';
import { converDate as convertDate } from '../../../sagas/common';

const useStyles = makeStyles()({
  root: {
    display: 'flex',
    position: 'relative',
  },
});

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const App: React.FC<PropsType> = (props: PropsType) => {
  const { classes } = useStyles();

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
   * カメラ起動を試みる。
   *
   * Android Chrome / iOS Safari では、カメラ許可が下りる前の enumerateDevices() は
   * ラベルが空・videoinput が取得できないことがあるため、必ず getUserMedia() を
   * 先に呼んで許可とストリームを取得する必要がある。
   *
   * 制約は「指定デバイス(exact) → 背面カメラ(facingMode) → 制約なし」の順で
   * 段階的に緩めて試行し、端末差による OverconstrainedError を回避する。
   */
  const getMediaStream = async (targetDeviceId: string): Promise<MediaStream> => {
    // 必須(min)制約は端末によって満たせず OverconstrainedError になるため ideal のみ指定
    const baseVideo: MediaTrackConstraints = {
      width: { ideal: 1080 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    };

    const attempts: MediaStreamConstraints[] = [];
    if (targetDeviceId) {
      // 明示的に選択されたデバイスを最優先
      attempts.push({ audio: false, video: { ...baseVideo, deviceId: { exact: targetDeviceId } } });
    }
    // 背面カメラ優先（iOS Safari では deviceId 指定より facingMode の方が確実）
    attempts.push({ audio: false, video: { ...baseVideo, facingMode: { ideal: 'environment' } } });
    // 最後の砦：制約なしで何でもよいので取得（PCのフロントカメラ等）
    attempts.push({ audio: false, video: true });

    let lastError: unknown;
    for (const constraints of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn('getUserMedia に失敗。次の制約で再試行します', constraints, e);
        lastError = e;
      }
    }
    throw lastError;
  };

  /**
   * QRコードの認識開始
   */
  const startRecogQr = async (deviceId = '') => {
    const targetDeviceId = deviceId ? deviceId : renderDeviceId;
    console.log('startRecogQr deviceId=' + targetDeviceId);
    stopRecogQR();

    // 既存ストリームを停止
    const currentVideo = document.querySelector('video') as HTMLVideoElement | null;
    if (currentVideo && currentVideo.srcObject) {
      (currentVideo.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      currentVideo.srcObject = null;
    }

    // 1. まず getUserMedia で許可取得＆ストリーム確保（enumerateDevices より先に呼ぶのが重要）
    let mediaStream: MediaStream;
    try {
      mediaStream = await getMediaStream(targetDeviceId);
    } catch (e) {
      console.error('カメラを起動できませんでした', e);
      alert('カメラを起動できませんでした。ブラウザのカメラ利用許可設定をご確認ください。');
      return;
    }

    // 2. 許可が下りた後に列挙する。ここで初めてラベルと deviceId が取得できる
    let devices = await navigator.mediaDevices.enumerateDevices();
    devices = devices.filter((device) => device.kind === 'videoinput');
    console.log(devices);
    setDeviceList(devices);

    // 3. 実際に使用中のデバイスを選択状態へ反映（ドロップダウンの表示を実態に合わせる）
    const activeDeviceId = mediaStream.getVideoTracks()[0]?.getSettings().deviceId ?? '';
    if (activeDeviceId) {
      setDeviceId(activeDeviceId);
    }

    // 4. video 要素へ反映。await の後なので要素が消えていないか再確認する
    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (!video) {
      // タブ離脱などで video 要素が無くなった場合はストリームを破棄
      mediaStream.getTracks().forEach((track) => track.stop());
      return;
    }
    video.srcObject = mediaStream;

    // 5. 認識処理
    const canv = document.createElement('canvas');
    canv.width = 720;
    canv.height = 720;
    // getImageData を毎フレーム呼ぶため willReadFrequently を有効化し、GPU→CPU の読み戻しを最適化する
    const context = canv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

    const id = window.setInterval(function () {
      // 映像がまだ来ていないフレームは処理しない（空画像への無駄な jsQR 実行を避ける）
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        return;
      }
      context.drawImage(video, 0, 0, 720, 720);

      const imageData = context.getImageData(0, 0, 720, 720);
      // QR は明地・暗コードが基本なので反転走査を行わない（既定の attemptBoth に対し約2倍高速）
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code && code.binaryData.length > 0) {
        // 読み取れたら結果出力
        console.log(code);
        stopRecogQR();
        setQrData({ byte: code.binaryData, data: code.data, version: code.version });
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
          <Select value={renderDeviceId} onChange={changeDeviceId} style={{ width: '90%' }} displayEmpty>
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
