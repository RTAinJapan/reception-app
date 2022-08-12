import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@mui/styles';
import CheckIcon from '@mui/icons-material/Check';
import { Button, CircularProgress, MenuItem, Paper, Select, SelectChangeEvent } from '@mui/material';
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
  const [date, setDate] = React.useState<string>('2022年8月11日');
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

  useEffect(() => {
    let newList: typeof dispVisitorList = JSON.parse(JSON.stringify(props.visitorList));
    newList = newList.filter((item) => item.date === date);
    newList = newList.sort((a, b) => {
      if (a.name.toString() > b.name.toString()) return 1;
      if (a.name.toString() < b.name.toString()) return -1;
      return 0;
    });

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
  }, [JSON.stringify(props.visitorList), date, dispType]);

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
        <Paper style={{ transform: 'translate(-50%, 0)', left: '50%', position: 'relative' }} onClick={showModal(visitor)}>
          <div>
            {acceptedList[visitor.code] && (
              <div style={{ position: 'absolute', right: 30 }}>
                <CheckIcon style={{ color: 'lightgreen', fontSize: 50 }} />
              </div>
            )}
            <div>{visitor.name}</div>
            <div>{typeToStr(visitor)}</div>
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
          <div
            className={'header-inner'}
            style={{ display: 'grid', gridTemplateColumns: '1fr 80px', padding: 5, background: props.theme === 'dark' ? 'rgb(21, 32, 43)' : 'white' }}
          >
            <Select value={date} onChange={changeDate}>
              <MenuItem value={'2022年8月11日'}>8月11日</MenuItem>
              <MenuItem value={'2022年8月12日'}>8月12日</MenuItem>
              <MenuItem value={'2022年8月13日'}>8月13日</MenuItem>
              <MenuItem value={'2022年8月14日'}>8月14日</MenuItem>
              <MenuItem value={'2022年8月15日'}>8月15日</MenuItem>
            </Select>
            <div>
              <Button style={{ height: '100%' }} variant={'contained'} onClick={changeDispType}>
                {dispTypeToTxt(dispType)}
              </Button>
            </div>
          </div>
        </div>

        {/* リスト */}
        <div className="content">{createList()}</div>
        <div style={{ float: 'right', marginTop: -50, marginRight: 20, bottom: 0, position: 'sticky' }}>{props.status === 'processing' ? <CircularProgress /> : ''}</div>
      </div>

      <Modal open={isShowModal} modalClose={closeModal}>
        <Paper style={{ height: '150px', width: '300px', padding: 20, maxWidth: '600px' }}>
          <div>名前：{showVisitor.name}</div>
          <div>区分：{typeToStr(showVisitor)}</div>
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
