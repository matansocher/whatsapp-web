import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase/config';
import {Loader, Main, Login} from './components';

function App() {
  const [user, loading] = useAuthState(auth);

  return (
    <div>
      {loading ? <Loader /> : !user ? <Login /> : <Main authUser={user} />}
    </div>
  );
}

export default App;
