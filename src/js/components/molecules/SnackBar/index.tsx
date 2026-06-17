import React from 'react';
import classNames from 'classnames';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import WarningIcon from '@mui/icons-material/Warning';
import { makeStyles } from 'tss-react/mui';
import { connect } from 'react-redux';
import { RootState } from '../../../reducers';
import { green, amber, blue, red } from '@mui/material/colors';
import customTheme from '../../../theme';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const useStyles = makeStyles()((theme) => ({
  snackbarMessage: {
    width: 'calc(100% - 60px)',
  },
  snackbarAction: {
    paddingLeft: 3,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  close: {},
}));

const snackbarBackground = {
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: red[600],
  },
  info: {
    backgroundColor: blue[600],
  },
  warning: {
    backgroundColor: amber[700],
  },
};

export type CustomeProps = {
  open: boolean;
  message: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  closable: boolean;
  onClose: (event: React.SyntheticEvent<any>, reason: string) => void;
};

type PropsType = ReturnType<typeof mapStateToProps>;
const CustomizedSnackbars: React.FC<CustomeProps> = (props: CustomeProps & PropsType) => {
  const { classes } = useStyles();
  const Icon = variantIcon[props.variant];

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={props.open}
      autoHideDuration={props.closable ? 6000 : null}
      onClose={props.closable ? props.onClose : undefined}
    >
      <SnackbarContent
        style={{ background: snackbarBackground[props.variant].backgroundColor, color: 'white' }}
        message={
          <span className={classes.message}>
            <Icon className={classNames(classes.icon, classes.iconVariant)} />
            {props.message}
          </span>
        }
        classes={{
          message: classes.snackbarMessage,
          action: classes.snackbarAction,
        }}
        // 閉じていい時は閉じるボタンを表示
        action={
          props.closable
            ? [
                <IconButton key="close" color="inherit" className={classes.close} onClick={props.onClose as any}>
                  <CloseIcon className={classes.icon} />
                </IconButton>,
              ]
            : []
        }
      />
    </Snackbar>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    theme: customTheme(state.content.theme.mode),
  };
};

// action
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(CustomizedSnackbars);
