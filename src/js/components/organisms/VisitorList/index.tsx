import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@mui/styles';
import CheckIcon from '@mui/icons-material/Check';
import { Button, CircularProgress, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import { Visitor } from '../../../types/global';
import { converDate, typeToStr } from '../../../sagas/common';
import Modal from '../../molecules/Modal';

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
  // 表示対象
  const [dispVisitorList, setDispVisitorList] = React.useState<Visitor[]>([]);
  const [acceptedList, setAcceptedList] = React.useState<{ [code: string]: string }>({});
  const [date, setDate] = React.useState<string>('runner');
  const [dispType, setDispType] = React.useState<0 | 1 | 2>(0);

  const [isShowModal, setIsShowModal] = React.useState<boolean>(false);
  const showModal = (visitor: Visitor) => () => {
    setShowVisitor(visitor);
    setIsShowModal(true);
  };
  const closeModal = () => {
    setIsShowModal(false);
  };
  const [showVisitor, setShowVisitor] = React.useState<Visitor>({ name: '', code: '', timestamp: '', type: 'visitor', isCancel: false, date: '', identifier: '' });
  const [caption, setCaption] = React.useState<string>('');

  // 入場者の表示リストを更新
  useEffect(() => {
    let newList: typeof dispVisitorList = JSON.parse(JSON.stringify(props.visitorList));
    if (['runner', 'commentator', 'volunteer', 'guest'].includes(date)) {
      newList = newList.filter((item) => item.type === date);
    } else {
      newList = newList.filter((item) => item.date === date);
    }
    newList = newList.sort((a, b) => {
      if (a.name.toString() > b.name.toString()) return 1;
      if (a.name.toString() < b.name.toString()) return -1;
      return 0;
    });
    const allNum = newList.length;
    const acceptedNum = newList.filter((item) => acceptedList[item.code]).length;

    // 表示種別
    switch (dispType) {
      case 0:
        break;
      case 1:
        newList = newList.filter((item) => acceptedList[item.code]);
        break;
      case 2:
        newList = newList.filter((item) => !acceptedList[item.code]);
        break;
    }

    // console.log(newList);
    setDispVisitorList(newList);
    setCaption(`受付数： ${acceptedNum} / ${allNum}`);
  }, [JSON.stringify(props.visitorList), JSON.stringify(acceptedList), date, dispType]);

  useEffect(() => {
    const newList: typeof acceptedList = {};
    for (const item of props.acceptedList) {
      newList[item.code] = item.timestamp;
    }
    // console.log(newList);
    setAcceptedList(newList);
  }, [JSON.stringify(props.acceptedList)]);

  const changeDate = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    setDate(event.target.value);
  };

  const changeDispType = () => {
    switch (dispType) {
      case 0:
        setDispType(1);
        break;
      case 1:
        setDispType(2);
        break;
      case 2:
        setDispType(0);
        break;
      default:
        setDispType(0);
    }
  };

  const dispTypeToTxt = (dispType: number) => {
    switch (dispType) {
      case 0:
        return '全表示';
      case 1:
        return '受付済';
      case 2:
        return '受付未';
      default:
        return '';
    }
  };

  const createList = () => {
    return <>{dispVisitorList.map(createVisitorList)}</>;
  };

  const createVisitorList = (visitor: Visitor) => {
    return (
      <button key={`${visitor.code}`} className={'qritem'}>
        <Paper style={{ transform: 'translate(-50%, 0)', left: '50%', position: 'relative', height: '2.3em', padding: 2 }} onClick={showModal(visitor)}>
          <div>
            {acceptedList[visitor.code] && (
              <div style={{ position: 'absolute', right: 30, top: -12 }}>
                <CheckIcon style={{ color: 'lightgreen', fontSize: 50 }} />
              </div>
            )}
            <div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{visitor.name}</div>
            {/* <div style={{ position: 'absolute', bottom: 0, transform: 'translateX(150%)' }}>{typeToStr(visitor.type)}</div> */}
          </div>
        </Paper>
      </button>
    );
  };

  return (
    <>
      <div>
        {/* メニューヘッダ */}
        <div className={'header'}>
          <div className={'header-inner'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', padding: 5, background: props.theme === 'dark' ? 'rgb(21, 32, 43)' : 'white' }}>
              <Select value={date} onChange={changeDate}>
                <MenuItem key={'runner'} value={'runner'}>
                  走者
                </MenuItem>
                <MenuItem key={'commentator'} value={'commentator'}>
                  解説
                </MenuItem>
                <MenuItem key={'volunteer'} value={'volunteer'}>
                  会場ボランティア
                </MenuItem>
                <MenuItem key={'guest'} value={'guest'}>
                  ゲスト
                </MenuItem>
                {props.dateList.map((date) => {
                  return (
                    <MenuItem key={date} value={date}>
                      観客：{date}
                    </MenuItem>
                  );
                })}
              </Select>
              <div>
                <Button style={{ height: '100%' }} variant={'contained'} onClick={changeDispType}>
                  {dispTypeToTxt(dispType)}
                </Button>
              </div>
            </div>
            {/* 補足情報 */}
            <div style={{ fontSize: 'small', paddingLeft: 10 }}>
              <Typography variant="caption">{caption}</Typography>
            </div>
          </div>
        </div>

        {/* リスト */}
        <div className="content" style={{ marginBottom: 80 }}>
          {createList()}
        </div>
        <div style={{ float: 'right', marginTop: -50, marginRight: 20, bottom: 0, position: 'sticky' }}>{props.status === 'processing' ? <CircularProgress /> : ''}</div>
      </div>

      <Modal open={isShowModal} modalClose={closeModal}>
        <Paper style={{ height: '150px', width: '300px', padding: 20, maxWidth: '600px' }}>
          <div>名前：{showVisitor.name}</div>
          <div>区分：{typeToStr(showVisitor.type)}</div>
          <div>フォーム更新日時：{converDate(showVisitor.timestamp)}</div>
          <div style={{ color: 'red', fontWeight: 400 }}>{showVisitor.isCancel ? 'キャンセル済' : ''}</div>
          <div>受付日時：{converDate(acceptedList[showVisitor.code])}</div>
        </Paper>
      </Modal>
    </>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    status: state.notify.status,
    dateList: state.content.config.date,
    visitorList: state.content.visitorList,
    acceptedList: state.content.acceptedList,
    theme: state.content.theme.mode,
  };
};

// action
const mapDispatchToProps = {
  changeNotify: actions.changeNotify,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
