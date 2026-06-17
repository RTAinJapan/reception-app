import React from 'react';
import { makeStyles } from 'tss-react/mui';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import { stopRecogQR } from '../../../common/util';

const useStyles = makeStyles()({
  root: {
    flexGrow: 1,
    position: 'sticky',
    bottom: 0,
    // 背景色はハードコードせず、Paper のテーマ（MuiPaper 上書き）に追従させる。
    // 以前は 'white' 固定で、ダークモード時に下部タブバーだけ白く残っていた。
    zIndex: 1000,
  },
  hidden: {
    display: 'hidden',
  },
});

type ComponentProps = {
  style: {
    top?: number;
    bottom?: number;
  };
  tabs: {
    label: string;
    icon?: React.ReactElement;
  }[];
};

const NavTabs: React.FC<React.PropsWithChildren<ComponentProps>> = (props) => {
  const { classes } = useStyles();
  const [tabIndex, setTabIndex] = React.useState(1);

  const handleChange = (event: React.ChangeEvent, newValue: any) => {
    setTabIndex(newValue);

    // 他から呼び出すいい手段が無かった
    stopRecogQR();
  };

  const createTab = (tabs: ComponentProps['tabs']) => {
    return tabs.map((item, index) => {
      return <Tab key={index} icon={item.icon} label={item.label} />;
    });
  };

  const createContent = (children: any) => {
    return (
      <>
        {children.map((child: React.ReactNode, index: number) => {
          if (index === tabIndex) {
            return (
              <Paper style={{ height: 'calc(100% - 75px)', overflowY: 'auto' }} key={`${index}`}>
                {child}
              </Paper>
            );
          } else {
            return (
              <div key={index}></div>
              // <div key={index} style={{ display: 'none' }}>
              //   {child}
              // </div>
            );
          }
        })}
      </>
    );
  };

  return (
    <>
      {createContent(props.children)}
      <Paper square className={classes.root}>
        <Tabs value={tabIndex} onChange={handleChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
          {createTab(props.tabs)}
        </Tabs>
      </Paper>
    </>
  );
};

export default NavTabs;
