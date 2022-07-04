import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@mui/styles';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import { CircularProgress, Paper } from '@mui/material';
import { Visitor } from '../../../types/global';
import { typeToStr } from '../../../sagas/common';

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

  useEffect(() => {
    setDispVisitorList(props.visitorList);
  }, [JSON.stringify(props.visitorList)]);

  const createList = () => {
    return <>{props.visitorList.map(createVisitorList)}</>;
  };

  const createVisitorList = (visitor: Visitor) => {
    return (
      <button key={`${visitor.qr}`} className={'qritem'}>
        <Paper style={{ transform: 'translate(-50%, 0)', left: '50%', position: 'relative' }}>
          <div>
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
          <div className={'header-inner'} style={{ display: 'grid', gridTemplateColumns: '1fr 65px', padding: 5 }}>
            {/*  */}
          </div>
        </div>

        {/* リスト */}
        <div className="content">{createList()}</div>
        <div style={{ float: 'right', marginTop: -50, marginRight: 20, bottom: 0, position: 'sticky' }}>{props.status === 'processing' ? <CircularProgress /> : ''}</div>
      </div>
    </>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    status: state.notify.status,
    visitorList: state.content.visitorList,
    theme: state.content.theme.mode,
  };
};

// action
const mapDispatchToProps = {
  changeNotify: actions.changeNotify,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
