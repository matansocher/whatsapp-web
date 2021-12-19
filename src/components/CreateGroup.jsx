import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import firebaseService from '../services/firebase/service';
import { useSelector } from 'react-redux';
import { getLastSeenString, generateRandomString } from '../services/commonService';

import { Avatar, Loader } from '.';
import {Save as SaveIcon, ArrowBack as ArrowBackIcon, Close as CloseIcon, ArrowForward as ArrowForwardIcon} from '@mui/icons-material';
import { Fab } from '@mui/material';

function CreateGroup({setIsCreateGroupScreen}) {
    const authUser = useSelector(state => state.authUserDetails.value);
    const [isLoading, setIsLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [chosenUsers, setChosenUsers] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');

    useEffect(() => {
        const getAllUsers = async () => {
            const usersRes = await firebaseService.getAllUserDetails();
            const users = usersRes.docs.map(user => user.data());
            const usersWithoutAuthUser = users.filter(user => user.uid !== authUser.uid);
            setContacts(usersWithoutAuthUser);
            setIsLoading(false);
        }
        getAllUsers();
    }, []);

    const handleChooseUser = (contact) => {
        const newChosenUsers = [...chosenUsers, contact];
        setChosenUsers(newChosenUsers);

        let users = [...contacts];
        users = users.filter(user => user.uid !== contact.uid);
        setContacts(users);
    }

    const removeChosenUser = (contact) => {
        const newChosenUsers = chosenUsers.filter(chosenUser => chosenUser.uid !== contact.uid);
        setChosenUsers(newChosenUsers);

        const users = [...contacts, contact];
        setContacts(users);
    }

    const handleSaveClicked = async () => {
        const chatId = generateRandomString(20);
        const chosenUsersIds = [...chosenUsers, authUser].map(chosenUser => chosenUser.uid);
        await firebaseService.setupChat(chatId, chosenUsersIds, subjectInput);
        setIsCreateGroupScreen(false);
    }

    const handleInputKeyDown = (e) => {
        setSubjectInput(e.target.value);
    }

    return (
        <Container>

            {isLoading ? <Loader /> : null}

            <Top>
                <ArrowBackIcon onClick={() => setIsCreateGroupScreen(false)} style={{marginRight: '10px', cursor: 'pointer'}} />
                <h2>New Group</h2>
            </Top>

            <Main>
                <InputWrapper>
                    <FloatingLabel>Group Subject</FloatingLabel>
                    <Input
                        id='subject'
                        name='subject'
                        value={subjectInput}
                        autoComplete='off'
                        onChange={handleInputKeyDown} />
                </InputWrapper>

                <ChosenUsers>
                    {!chosenUsers || !chosenUsers.length ? null : chosenUsers.map(chosenUser => {
                        const { chosenDisplayName, displayName } = chosenUser;
                        return <ChosenUser key={chosenUser.uid} onClick={() => removeChosenUser(chosenUser)}>
                            <ChosenUserLeft>
                                <Avatar size='small' name={chosenDisplayName || displayName} />
                            </ChosenUserLeft>
                            <ChosenUserRight>
                                <Name>{chosenDisplayName || displayName}</Name>
                                <CloseIcon onClick={() => removeChosenUser(chosenUser)} />
                            </ChosenUserRight>
                        </ChosenUser>
                    })}
                </ChosenUsers>

                <Divider />

                {!contacts || !contacts.length ? null : contacts.map(contact => {
                    const { chosenDisplayName, displayName, email, lastSeen, photoURL, uid } = contact;
                    return <Contact key={contact.uid} onClick={() => handleChooseUser(contact)}>
                        <ContactLeft>
                            <Avatar name={chosenDisplayName || displayName} />
                        </ContactLeft>
                        <ContactRight>
                            <Name>{chosenDisplayName || displayName}</Name>
                            <Time>
                                <p>{getLastSeenString(lastSeen ? lastSeen : null)}</p>
                            </Time>
                        </ContactRight>
                    </Contact>
                })}
            </Main>

            {chosenUsers.length && subjectInput.length ? <NextButton><Fab variant='extended' size='medium' color='primary' aria-label='add' onClick={handleSaveClicked}>
                <ArrowForwardIcon />
            </Fab></NextButton> : null}
        </Container>
    )
}

export default CreateGroup;

const Container = styled.div`
    background-color: #15202b;
    overflow: hidden;
    height: 100vh;
    position: relative;
`;

const Top = styled.div`
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 20px;
`;

const Main = styled.div`
    padding-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50px;
`;

const NextButton = styled.div`
    position: absolute;
    left: 50%;
    bottom: 30px;
    transform: translateX(-50%);

    button {
        padding: 10px;
    }

    svg {
        margin-right: 0;
    }
`;

const Contact = styled.div`
    display: flex;
    align-items: center;
    width: 90%;
    padding: 10px;
    cursor: pointer;
    border-radius: 10px;
    &:hover {
        background-color: rgba(53, 205, 149, .3);
    }
`;

const ContactLeft = styled.div`
    margin-right: 10px;
`;

const ContactRight = styled.div`
    display: flex;
    flex-direction: column;
`;

const Name = styled.p`
    display: inline-flex;
    max-width: 100%;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    color: #35cd96;
`;

const Time = styled.div`
    display: flex;
    align-items: center;
    height: 15px;
    white-space: nowrap;
    float: right;
    margin-top: 4px;
    color: rgba(241,241,242,0.63);
    p {
        font-size: 11px;
        line-height: 15px;
    }
`;

const ChosenUsers = styled.div`
    width: 100%;
    padding-left: 50px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Divider = styled.div`
    height: 1px;
    width: 100%;
    background: #040404;
    margin: 20px 0;
`;

const ChosenUser = styled.div`
    display: flex;
    align-items: center;
    height: 15px;
    white-space: nowrap;
    float: right;
    margin-top: 4px;
    color: rgba(241,241,242,0.63);
    background-color: rgba(0,0,0,.4);
    cursor: pointer;
    height: 26px;
    border-radius: 15px;
    padding: 4px;
    transition: .3;
    &:hover {
        opacity: .8;
    }
    p {
        font-size: 11px;
        line-height: 15px;
    }
`;

const ChosenUserLeft = styled.div`
    margin-right: 10px;
`;

const ChosenUserRight = styled.div`
    display: flex;
    align-items: center;
`;

const InputWrapper = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 20px 0;
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
