import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@mui/styles';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import jsQR from 'jsqr';
import { MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { stopRecogQR } from '../../../common/util';
import { Visitor } from '../../../types/global';

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
const App: React.FC<PropsType> = (props: PropsType) => {
  const classes = useStyles();

  const [deviceList, setDeviceList] = React.useState<MediaDeviceInfo[]>([]);
  const [renderDeviceId, setDeviceId] = React.useState(props.readerDeviceId);
  const [qrData, setQrData] = React.useState<{ byte: number[]; data: string; version: number } | null>(null);

  const [visitorList, setVisitorList] = React.useState<typeof props.visitorList>([]);
  const [acceptedList, setAcceptedList] = React.useState<typeof props.acceptedList>([]);
  const [acceptedIdentifier, setAcceptedIdentifier] = React.useState<typeof props.acceptedIdentifier>([]);

  const [successAudio] = React.useState<HTMLAudioElement>(new Audio("./sound/success.mp3"));
  const [failAudio] = React.useState<HTMLAudioElement>(new Audio("./sound/fail.mp3"));

  useEffect(() => {
    startRecogQr();
  }, []);

  useEffect(() => {
    // 1分ごとにデータ更新
    setInterval(() => {
      // 認識結果表示中の時はスキップ
      if (!qrData) {
        props.fetchVisitorList();
      }
    }, 60 * 1000);
  }, []);

  useEffect(() => setVisitorList(props.visitorList), [props.visitorList.join("")]);
  useEffect(() => setAcceptedList(props.acceptedList), [props.acceptedList.join("")]);
  useEffect(() => setAcceptedIdentifier(props.acceptedIdentifier), [props.acceptedIdentifier.join("")]);

  const handleCancelReader = () => {
    setQrData(null);
    startRecogQr(renderDeviceId);
  };

  /** コード承認 */
  const handleConfirmQr = (visitor: Visitor) => {
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
    setQrData(null);
    startRecogQr(renderDeviceId);
  };

  /** identifierを同じくする他の入場者情報（役職違いとか）を抽出。引数指定したやつは返さない */
  const pickIdentifier = (visitor: Visitor): Visitor[] => {
    const result = visitorList.filter((item) => item.code !== visitor.code && item.identifier === visitor.identifier);
    console.log(`pickIdentifier=${result.length}`);
    return result;
  };

  const pickVideoDevice = async () => {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind.includes('videoinput'));
    console.log(`使用可能なデバイス数: ${devices.length}`);
    console.log(devices);
    return devices;
  }

  /**
   * QRコードの認識開始
   */
  const startRecogQr = async (deviceId = '') => {
    try {

      let targetDeviceId = deviceId ? deviceId : renderDeviceId;
      console.log('startRecogQr deviceId=' + targetDeviceId);
      stopRecogQR();

      const devices = await pickVideoDevice();
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
        console.log("srcObject を停止");
        srcObj.getTracks().map((item) => item.stop());
      }

      // カメラ起動
      console.log(`カメラ起動 targetDeviceId = ${targetDeviceId}`);
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
      console.log("-------------- mediaStream --------------");
      console.log(mediaStream);

      document.querySelector('video')!.srcObject = mediaStream;
      console.log(`${document.querySelector('video')!.width}  ${document.querySelector('video')!.height}`);

      const video = document.querySelector('video') as HTMLVideoElement;
      const canv = document.createElement('canvas');
      canv.width = Math.max(720, window.innerWidth);
      canv.height = 720;
      const context = canv.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

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
    } catch (e) {
      console.warn(e);
    }
  };

  const changeDeviceId = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    props.updateDeviceId(event.target.value);
    setDeviceId(event.target.value);
    startRecogQr(event.target.value);
  };

  const createQrReader = () => {
    console.log("createQrReader");

    return (
      <div style={{ height: '100%' }}>
        <div style={{ marginTop: 20, marginBottom: 20, textAlign: 'center' }}>
          <Typography variant="h3">QRコードをかざしてください。</Typography>
          <Typography variant="h3">Scan the QR code.</Typography>
        </div>
        <video id="qrReader" autoPlay playsInline={true} className="qr_reader" width={Math.max(720, window.innerWidth)} height={720}></video>
        <div style={{ position: 'absolute', bottom: 70, width: '90%' }}>
          <Typography variant={'h6'}>Device</Typography>
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
    console.log("createQrResult");

    const txt = qrData?.data ?? '';

    // 読み取ったコードをリストの中から探索
    const visitor = visitorList.find((item) => item.code === txt);
    console.log(visitor);

    const types: Visitor['category'][] = [];
    let isExpired = false;
    let isUsed = false;
    let isVisitor = false;
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

      // 使用済みコード
      isUsed = acceptedList.map((item) => item.code).includes(visitor.code);

      // 観客であるか
      isVisitor = visitor.isDailyAccept;
    }

    console.log(`isExpired=${isExpired} isUsed=${isUsed} isVisitor=${isVisitor}`)
    setTimeout(() => {
      if (visitor && !isExpired && !(!isUsed && !isVisitor)) {
        // 認証
        handleConfirmQr(visitor);
      } else {
        handleCancelReader();
      }
    }, 2500);



    const createContent = () => {
      console.log("createContent");

      // QRに該当無し
      if (!visitor) {
        failAudio.play();

        return (
          <div style={{ marginBottom: 50, backgroundColor: "#FF97C2" }}>
            <Typography variant="h3">無効なQRコードです。入場できません。</Typography>
            <Typography variant="h3">Invalid QR code.</Typography>
          </div>
        )
      }

      if (isExpired) {
        failAudio.play();

        return (
          <div style={{ marginBottom: 50, backgroundColor: "#FF97C2" }}>
            <Typography variant="h3">QRコードが有効期限外です。入場できません。</Typography>
            <Typography variant="h3">Expired QR code.</Typography>
          </div>
        )
      }

      // 未使用、かつ観客以外
      // 名札持ちがまだ入場してない場合は受付で認証してもらう
      if (!isUsed && !isVisitor) {
        failAudio.play();

        return (
          <div style={{ marginBottom: 50, backgroundColor: "#FFFF99" }}>
            <Typography variant="h3">受付で認証してください。</Typography>
            <Typography variant="h3">Ask staff to reception.</Typography>
          </div>
        )
      }

      successAudio.play();
      return (
        <div style={{ marginBottom: 10 }}>
          <Typography variant="h3">
            入場してください。
          </Typography>
          <Typography variant="h3">
            Enter the Room.
          </Typography>
        </div>
      )
    }

    return (
      <div style={{ textAlign: 'center', height: '100%' }}>
        <div style={{ top: 100, position: 'sticky' }}>
          {createContent()}
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
  fetchVisitorList: actions.fetchVisitorList,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
