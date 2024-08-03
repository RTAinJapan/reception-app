import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@mui/styles';
import CheckIcon from '@mui/icons-material/Check';
import { Button, CircularProgress, Fab, MenuItem, Paper, Select, SelectChangeEvent, Typography, Theme } from '@mui/material';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import { Visitor } from '../../../types/global';
import { convertDate } from '../../../sagas/common';
import Modal from '../../molecules/Modal';
import RefreshIcon from '@mui/icons-material/Refresh';

const useStyles = () =>
  makeStyles({
    root: {
      display: 'flex',
      position: 'relative',
    },
    reloadButton: {
      position: 'absolute !important' as any,
      bottom: '6em',
      right: '1em',
    },
  })();

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const App: React.SFC<PropsType> = (props: PropsType) => {
  const classes = useStyles();
  // 表示対象の入場者
  const [dispVisitorList, setDispVisitorList] = React.useState<Visitor[]>([]);
  // 入場受付済み
  const [acceptedList, setAcceptedList] = React.useState<{ [code: string]: string }>({});
  // 入場者種別セレクトボックス選択中要素
  const [selectedCategory, setSelectedCategory] = React.useState<string>('走者');
  enum DISP_TYPE {
    ALL,
    ACCEPTED,
    NOT_ACCEPTED,
  }
  const [dispType, setDispType] = React.useState<DISP_TYPE>(DISP_TYPE.ALL);
  // 入場者種別セレクトボックス表示要素
  const [categories, setCategories] = React.useState<string[]>([]);

  const [isShowModal, setIsShowModal] = React.useState<boolean>(false);
  // 入場者単体表示
  const [showVisitor, setShowVisitor] = React.useState<Visitor>({ id: '', name: '', code: '', category: '', start_at: '', end_at: '', identifier: '', isDailyAccept: false });
  const [caption, setCaption] = React.useState<string>('');

  // セレクトボックス更新
  useEffect(() => {
    const tmp: string[] = [];
    props.visitorList.map((item) => {
      // 観客以外をプルダウンとして表示
      if (!tmp.includes(item.category) && !item.category.includes("観客")) {
        tmp.push(item.category);
      }
    });
    setCategories(tmp);
  }, [JSON.stringify(props.visitorList)]);

  // 入場者の表示リストを更新
  useEffect(() => {
    // カテゴリーで絞り込み
    let newList: typeof dispVisitorList = JSON.parse(JSON.stringify(props.visitorList));
    newList = newList.filter((item) => item.category === selectedCategory);

    // 受付数
    const allNum = newList.length;
    const acceptedNum = newList.filter((item) => acceptedList[item.code]).length;

    // 表示種別で絞り込み
    switch (dispType) {
      case DISP_TYPE.ALL:
        break;
      case DISP_TYPE.ACCEPTED:
        newList = newList.filter((item) => acceptedList[item.code]);
        break;
      case DISP_TYPE.NOT_ACCEPTED:
        newList = newList.filter((item) => !acceptedList[item.code]);
        break;
    }

    // 名前順でソート
    newList = newList.sort((a, b) => {
      if (a.name.toString().toLowerCase() > b.name.toString().toLowerCase()) return 1;
      if (a.name.toString().toLowerCase() < b.name.toString().toLowerCase()) return -1;
      return 0;
    });

    // console.log(newList);
    setDispVisitorList(newList);
    setCaption(`受付数： ${acceptedNum} / ${allNum}`);
  }, [JSON.stringify(props.visitorList), JSON.stringify(acceptedList), selectedCategory, dispType]);

  useEffect(() => {
    const newList: typeof acceptedList = {};
    for (const item of props.acceptedList) {
      newList[item.code] = item.timestamp;
    }
    // console.log(newList);
    setAcceptedList(newList);
  }, [JSON.stringify(props.acceptedList)]);

  const changeCategory = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    setSelectedCategory(event.target.value);
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

  // 単体表示モーダル 表示切り替え
  const showModal = (visitor: Visitor) => () => {
    setShowVisitor(visitor);
    setIsShowModal(true);
  };
  const closeModal = () => {
    setIsShowModal(false);
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
              {/* 入場者種別 */}
              <Select value={selectedCategory} onChange={changeCategory}>
                {categories.map((category) => {
                  return (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  );
                })}
              </Select>
              {/* 表示種別 */}
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
        {/* データ更新ボタン */}
        <div style={{ height: '100%' }}>
          <Fab className={classes.reloadButton} color={'primary'} onClick={() => props.fetchVisitorList()}>
            <RefreshIcon />
          </Fab>
        </div>
        <div style={{ float: 'right', marginTop: -50, marginRight: 20, bottom: 0, position: 'sticky' }}>{props.status === 'processing' ? <CircularProgress /> : ''}</div>
      </div>

      {/* 単体表示 */}
      <Modal open={isShowModal} modalClose={closeModal}>
        <Paper style={{ height: '150px', width: '300px', padding: 20, maxWidth: '600px' }}>
          <div>名前：{showVisitor.name}</div>
          <div>区分：{showVisitor.category}</div>
          <div>コード：{showVisitor.code}</div>
          <div>有効期限：{convertDate(showVisitor.start_at)}～{convertDate(showVisitor.end_at)}</div>
          <div>受付日時：{convertDate(acceptedList[showVisitor.code])}</div>
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
  fetchVisitorList: actions.fetchVisitorList,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
