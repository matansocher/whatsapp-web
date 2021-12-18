import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import firebaseService from '../services/firebase/service';
import { getLastSeenString } from '../services/commonService';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentChatUser } from '../redux/currentChatUser';

import { Avatar, Loader } from '.';

import {Info as InfoIcon, Email as EmailIcon, AccessTime as AccessTimeIcon, Person as PersonIcon, Close as CloseIcon} from '@mui/icons-material';

function ContactInfo({setIsContactInfoScreenVisible}) {    
    const currentChatUser = useSelector(state => state.currentChatUser.value);
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getCurrentChatUserDetails = async () => {
            const res = await firebaseService.getUserDetails(currentChatUser.uid).get();
            const CurrentChatUserDetails = res.docs.map(doc => doc.data())[0];
            if (CurrentChatUserDetails) {
                dispatch(setCurrentChatUser(CurrentChatUserDetails));
            }
            setIsLoading(false);
        }
        getCurrentChatUserDetails();
    }, [currentChatUser, dispatch]);

    return (
        <Container>

            {isLoading ? <Loader /> : null}

            <Top>
                <CloseIcon onClick={() => setIsContactInfoScreenVisible(false)} style={{marginRight: '10px', cursor: 'pointer'}} />
                <h2>Contact Info</h2>
            </Top>

            <Main>
                {!currentChatUser ? null : <AvatarWrapper><Avatar size={'big'} photo={currentChatUser.photoURL} name={currentChatUser.chosenDisplayName || currentChatUser.displayName || currentChatUser.email} /></AvatarWrapper>}

                {!currentChatUser.chosenDisplayName && !currentChatUser.displayName ? null : <Section>
                    <PersonIcon />
                    <h3>{currentChatUser.chosenDisplayName || currentChatUser.displayName}</h3>
                </Section>}

                {!currentChatUser.lastSeen ? null : <Section>
                    <AccessTimeIcon />
                    <h3>{`last seen ${getLastSeenString(currentChatUser.lastSeen)}`}</h3>
                </Section>}

                {!currentChatUser.email ? null : <Section>
                    <EmailIcon />
                    <h3>{currentChatUser.email}</h3>
                </Section>}

                {!currentChatUser.about ? null : <Section>
                    <InfoIcon />
                    <h3>{currentChatUser.about}</h3>
                </Section>}

            </Main>

        </Container>
    )
}

export default ContactInfo;

const Container = styled.div`
    width: 30%;
    background-color: #15202b;
    overflow: hidden;
    height: 100vh;
    z-index: 9;
`;

const Top = styled.div`
    display: flex;
    align-items: center;
    height: 75px;
    padding: 0 20px;
`;

const AvatarWrapper = styled.div`
    margin-bottom: 50px;
`;

const Main = styled.div`
    padding-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50px;
`;

const Section = styled.div`
    width: 90%;
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 20px;
    &:hover {
        background: unset;
    }
    h3 {
        margin-left: 10px;
        font-size: 15px;
        font-weight: 400;
    }
`;
