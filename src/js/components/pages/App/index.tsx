import React from 'react';
import * as actions from '../../../actions';
import NavTabs from '../../organisms/NavTabs';
import VisitorList from '../../organisms/VisitorList';
import QrReader from '../../organisms/QrReader';
import Setting from '../../organisms/Setting';
import ListIcon from '@mui/icons-material/List';
import CameraIcon from '@mui/icons-material/QrCode2';
import SettingIcon from '@mui/icons-material/Settings';
import { Button, Paper, Theme, ThemeProvider } from '@mui/material';
import { RootState } from '../../../reducers';
import { connect } from 'react-redux';
import customTheme from '../../../theme';
import { makeStyles } from 'tss-react/mui';
import SnackBar from '../../molecules/SnackBar';
import Dialog from '../../organisms/Dialog';
import Modal from '../../molecules/Modal';

const useStyles = makeStyles()({
  root: {
    justifyContent: 'center',
    display: 'initial',
    width: '100%',
    height: '100%',
  },
  login: {
    padding: 10,
  },
});

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const App: React.FC<PropsType> = (props: PropsType) => {
  const { classes } = useStyles();

  // iOS の引っ張り(オーバースクロール/ラバーバンド)領域や Safari のツールバー色を
  // テーマに合わせる。ラバーバンドの背景は html の background-color で決まるため、
  // html/body にテーマの背景色を設定し、theme-color メタも更新する。
  React.useEffect(() => {
    const bg = props.theme.palette.background.default;
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = bg;
  }, [props.theme]);

  const tabs = [
    {
      label: 'QRリーダー',
      icon: <CameraIcon />,
    },
    {
      label: '入場者リスト',
      icon: <ListIcon />,
    },
    {
      label: '設定',
      icon: <SettingIcon />,
    },
  ];
  return (
    <ThemeProvider theme={props.theme}>
      <Paper className={classes.root}>
        <div className={'SW-update-dialog'} />
        {props.status !== 'initialize' && props.discord.username ? (
          <NavTabs tabs={tabs} style={{ top: 0 }}>
            <QrReader />
            <VisitorList />
            <Setting />
          </NavTabs>
        ) : (
          <div className={classes.login}>
            <Modal open={true}>
              <Button color={'primary'} variant={'contained'} onClick={props.loginDiscord} disabled={props.status !== 'ok'}>
                Discordでログイン
              </Button>
            </Modal>
          </div>
        )}
      </Paper>
      {/* 通知系 */}
      <Dialog />

      <SnackBar open={props.notify.show} message={props.notify.message} variant={props.notify.type} closable={props.notify.closable} onClose={props.closeNotify} />
    </ThemeProvider>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    notify: state.notify.notify,
    dialog: state.notify.dialog,
    discord: state.content.discord,
    theme: customTheme(state.content.theme.mode),
    status: state.notify.status,
  };
};

// action
const mapDispatchToProps = {
  closeNotify: actions.closeNotify,
  loginDiscord: actions.loginDiscord,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
