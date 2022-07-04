import { combineReducers } from 'redux';
import { NotifyState } from './notify';
import { ContentState } from './content';
import notify from './notify';
import content from './content';

export type RootState = {
  content: ContentState;
  notify: NotifyState;
};

export default combineReducers({ notify, content });
