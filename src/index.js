import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import authUserDetailsReducer from './redux/authUserDetails';
import currentChatIdReducer from './redux/currentChatId';
import currentChatUsersReducer from './redux/currentChatUsers';
import currentReplyMessageReducer from './redux/currentReplyMessage';
import starredMessagesIdsReducer from './redux/starredMessagesIds';

const store = configureStore({
  reducer: {
    authUserDetails: authUserDetailsReducer,
    currentChatId: currentChatIdReducer,
    currentChatUsers: currentChatUsersReducer,
    currentReplyMessage: currentReplyMessageReducer,
    starredMessagesIds: starredMessagesIdsReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
