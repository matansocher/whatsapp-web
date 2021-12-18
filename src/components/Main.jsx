import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { useSelector, useDispatch } from 'react-redux';
import {setAuthUserDetails} from '../redux/authUserDetails';
import {setStarredMessagesIds} from '../redux/starredMessagesIds';
import firebaseService from '../services/firebase/service';

import { HeaderInfo, ChatsList, Chat, EditProfile, Loader } from '.';

function Main({authUser: firebaseAuthUser}) {

    const authUser = useSelector(state => state.authUserDetails.value);
    const currentChatId = useSelector(state => state.currentChatId.value);
    const dispatch = useDispatch();

    const theme = createTheme({ palette: { mode: 'dark' } }); // useMemo(() => createTheme({ palette: { mode: 'dark' } }), ['dark'])

    const [isLoading, setIsLoading] = useState(true);
    const [isEditProfileScreen, setIsEditProfileScreen] = useState(false);

    useEffect(() => { // update user data when logging in
        const upsertUserData = () => { // updating or adding user details to users collection
            const { email, displayName, uid, photoURL } = firebaseAuthUser;
            const userData = { email: email.toLowerCase(), displayName, uid, photoURL, lastSeen: 'Online' };
            firebaseService.upsertUserData(userData);
        }
        upsertUserData();
    }, [firebaseAuthUser]);

    useEffect(() => { // update user data when logging in
        const getUserDetails = () => { // updating or adding user details to users collection
            const { uid } = firebaseAuthUser;
            firebaseService.getUserDetails(uid).onSnapshot(snapshot => {
                const authUserDetails = snapshot.docs.map(doc => doc.data())[0];
                if (authUserDetails) {
                    dispatch(setAuthUserDetails(authUserDetails));
                }
                setIsLoading(false);
            });
        }
        getUserDetails();
    }, [firebaseAuthUser, dispatch]);

    useEffect(() => { // update user data when logging in
        if (!authUser) {
            return
        }
        const getStarredMessagesIds = () => { // updating or adding user details to users collection
            firebaseService.getStarredMessagesIds(authUser.uid).onSnapshot(snapshot => {
                if (snapshot.empty) {
                    return dispatch(setStarredMessagesIds([]));
                }
                const starredMessagesIds = snapshot.docs.map(doc => doc.id);
                dispatch(setStarredMessagesIds(starredMessagesIds));
            });
        }
        getStarredMessagesIds();
    }, [authUser, dispatch]);

    useEffect(() => {
        if (!authUser) {
            return;
        }
        const cleanup = () => {
            firebaseService.updateLastSeen(authUser.uid);
            if (currentChatId) {
                firebaseService.stopTyping(authUser.uid, currentChatId);
            }
        }

        window.addEventListener('beforeunload', e => cleanup()); // on browser close
        return () => cleanup; // when main component is unmounted
    }, [authUser, currentChatId]);

    return (
        <ThemeProvider theme={theme}>
            {isLoading ? <Loader /> : <MainContainer>
                <Left>
                    {isEditProfileScreen ? <EditProfile setIsEditProfileScreen={setIsEditProfileScreen} /> : 
                        <>
                            <HeaderInfo setIsEditProfileScreen={setIsEditProfileScreen} />
                            <ChatsList />
                        </>
                    }
                </Left>
                <Right>
                    <Chat/>
                </Right>
            </MainContainer>}
        </ThemeProvider>
    )
}

export default Main;

const MainContainer = styled.div`
    display: flex;
`;

const Left = styled.div`
    flex: 0.3;
    border-right: 1px solid black;
`;

const Right = styled.div`
    height: 100%;
    flex: 0.7;
`;
