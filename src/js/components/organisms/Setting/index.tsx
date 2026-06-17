import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup, Switch, Typography } from '@mui/material';
import customTheme from '../../../theme';

const useStyles = makeStyles()({
  root: {
    width: '100%',
    padding: 10,
    // padding 込みで幅が viewport を超え横スクロールが出るのを防ぐ
    boxSizing: 'border-box',
  },
  content: {
    marginBottom: 10,
  },
  controlButton: {
    margin: 5,
    padding: 2,
    border: 'solid 1px',
    borderRadius: '5px',
    width: 150,
    borderColor: 'black',
  },
});

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const App: React.FC<PropsType> = (props: PropsType) => {
  const { classes } = useStyles();

  const lightTheme = customTheme('light');
  const darkTheme = customTheme('dark');
  const [themeMode, setthemeMode] = React.useState(props.theme.mode);
  const handleChangeTheme = (event: any) => {
    setthemeMode(event.target.value);
    console.log(event.target.value);
    props.updateTheme(event.target.value);
  };

  return (
    <div className={classes.root}>
      {/* テーマ設定 */}
      <div className={classes.content}>
        <FormControl>
          {/* <FormLabel id="demo-row-radio-buttons-group-label">テーマ</FormLabel> */}
          <Typography variant="h6">テーマ</Typography>
          <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group" value={themeMode} onChange={handleChangeTheme}>
            <div className={classes.controlButton} style={{ backgroundColor: lightTheme.palette.background.default }}>
              <FormControlLabel value="light" control={<Radio />} label="light" style={{ width: '100%', color: lightTheme.palette.text.primary }} />
            </div>
            <div className={classes.controlButton} style={{ backgroundColor: darkTheme.palette.background.default }}>
              <FormControlLabel value="dark" control={<Radio />} label="dark" style={{ width: '100%', color: darkTheme.palette.text.primary }} />
            </div>
          </RadioGroup>
        </FormControl>
      </div>

      {/* QR読み取りの軽量モード（低スペック端末向け） */}
      <div className={classes.content}>
        <Typography variant="h6">QR読み取り</Typography>
        <FormControlLabel
          control={<Switch checked={props.lowSpecMode} onChange={(_event, checked) => props.updateLowSpecMode(checked)} />}
          label="軽量モード（動作が重い端末向け）"
        />
        <Typography variant="caption" component="p">
          解像度と走査頻度を下げて負荷を減らします。読み取りにくくなった場合や端末が熱くなる・カクつく場合に ON にしてください。
        </Typography>
      </div>

      {/* 未送信（保留中）の受付。通信不能時に蓄積され、回復時に自動再送される */}
      {props.pendingAccepts.length > 0 && (
        <div className={classes.content}>
          <Typography variant="h6">未送信の受付</Typography>
          <Typography variant="body2">通信不能のため {props.pendingAccepts.length} 件が未送信です。通信回復時に自動送信されますが、手動でも再送できます。</Typography>
          <Button variant="contained" color="primary" onClick={() => props.flushPendingAccepts()} style={{ marginTop: 5 }}>
            今すぐ再送信
          </Button>
        </div>
      )}
    </div>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    theme: state.content.theme,
    pendingAccepts: state.content.pendingAccepts,
    lowSpecMode: state.content.displaySetting.lowSpecMode,
  };
};

// action
const mapDispatchToProps = {
  updateTheme: actions.updateTheme,
  changeNotify: actions.changeNotify,
  flushPendingAccepts: actions.flushPendingAccepts,
  updateLowSpecMode: actions.updateLowSpecMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
