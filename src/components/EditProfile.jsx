import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import firebaseService from '../services/firebase/service';
import { useSelector } from 'react-redux';

import { Avatar, Loader } from '.';

import {Save as SaveIcon, ArrowBack as ArrowBackIcon} from '@mui/icons-material';
import { Fab } from '@mui/material';

function EditProfile({ setIsEditProfileScreen }) {    
    const authUser = useSelector(state => state.authUserDetails.value);
    const [displayNameInput, setDisplayNameInput] = useState('');
    const [aboutInput, setAboutInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasMadeChanges, setHasMadeChanges] = useState(false);

    useEffect(() => {
        if (!authUser) {
            return;
        }
        const { about = '', chosenDisplayName = '', displayName = '' } = authUser;
        setDisplayNameInput(chosenDisplayName || displayName);
        setAboutInput(about);
    }, [authUser]);

    useEffect(() => {
        if (!authUser) {
            return;
        }
        const chosenDisplayName = displayNameInput.trim();
        const about = aboutInput.trim();
        const { about: authAbout, chosenDisplayName: authChosenDisplayName } = authUser;
        if (chosenDisplayName !== authChosenDisplayName || about !== authAbout) {
            setHasMadeChanges(true);
        } else {
            setHasMadeChanges(false);
        }
    }, [authUser, displayNameInput, aboutInput]);

    const updateUserDetails = async (e) => {
        const chosenDisplayName = displayNameInput.trim();
        const about = aboutInput.trim();
        setIsLoading(true);
        await firebaseService.upsertUserData({ uid: authUser.uid, chosenDisplayName, about });
        setHasMadeChanges(false);
        setIsLoading(false);
    }

    const handleInputKeyDown = (e) => {
        const inputName = e.target.name;
        switch (inputName) {
            case 'about': setAboutInput(e.target.value); break;
            case 'displayName': setDisplayNameInput(e.target.value); break;
            default: break;
        }
    }

    return (
        <Container>

            {isLoading ? <Loader /> : null}

            <Top>
                <ArrowBackIcon onClick={() => setIsEditProfileScreen(false)} style={{marginRight: '10px', cursor: 'pointer'}} />
                <h2>Edit Profile</h2>
            </Top>

            <Main>
                {!authUser ? null : <Avatar size={'big'} photo={authUser.photoURL} name={authUser.chosenDisplayName || authUser.displayName || authUser.email} />}

                <InputWrapper>
                    <FloatingLabel>Display Name</FloatingLabel>
                    <Input
                        id='displayName'
                        name='displayName'
                        value={displayNameInput}
                        autoComplete='off'
                        onChange={handleInputKeyDown} />
                </InputWrapper>

                <InputWrapper>
                    <FloatingLabel>About</FloatingLabel>
                    <Input
                        id='about'
                        name='about'
                        value={aboutInput}
                        autoComplete='off'
                        onChange={handleInputKeyDown} />
                    <InputLabel htmlFor='about'>Any details such as age, occupation or city. Example: 23 y.o. designer from San Francisco</InputLabel>
                </InputWrapper>

            </Main>

            {hasMadeChanges ? <SaveButton><Fab variant='extended' size='medium' color='primary' aria-label='add' onClick={updateUserDetails}>
                <SaveIcon sx={{ mr: 1 }} />
            </Fab></SaveButton> : null}
        </Container>
    )
}

export default EditProfile;

const Container = styled.div`
    background-color: #15202b;
    overflow: hidden;
    height: 100vh;
    position: relative;
`;

const Top = styled.div`
    display: flex;
    align-items: center;
    height: 75px;
    padding: 0 20px;
`;

const Main = styled.div`
    padding-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50px;
`;

const InputWrapper = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 20px;
    width: 80%;
`;

const Input = styled.input`
    position: relative;
    height: 54px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: relative;
    border-radius: 10px;
    padding: 15px;
    border: 1px solid #302e30;
    outline: none;
    font-size: 16px;
    color: #d4d5d7;
    background-color: transparent;
    font-weight: 400;
    box-sizing: border-box;

`;

const FloatingLabel = styled.p`
    position: absolute;
    top: -7px;
    left: 15px;
    z-index: 9;
    font-size: 12px;
`;

const InputLabel = styled.label`
    color: #aaaaaa;
    margin-top: 20px;
    font-size: 14px;
`;

const SaveButton = styled.div`
    position: absolute;
    right: 30px;
    bottom: 30px;

    button {
        padding: 10px;
    }

    svg {
        margin-right: 0;
    }
`;