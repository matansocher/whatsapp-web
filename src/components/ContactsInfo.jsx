import React, { useState, useEffect } from 'react';
import { flatten } from 'lodash';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import firebaseService from '../services/firebase/service';
import { getLastSeenString } from '../services/commonService';

import { Avatar, Loader } from '.';

import {Info as InfoIcon, Email as EmailIcon, AccessTime as AccessTimeIcon, Person as PersonIcon, Close as CloseIcon} from '@mui/icons-material';

function ContactsInfo({setIsContactInfoScreenVisible, contacts}) {    

    const authUser = useSelector(state => state.authUserDetails.value);
    const [isLoading, setIsLoading] = useState(true);
    const [enrichedContacts, setEnrichedContacts] = useState(true);

    useEffect(() => {
        const getCurrentChatUsersDetails = async () => {
            const promisesArr = []
            contacts.forEach(contact => {
                promisesArr.push(firebaseService.getUserDetails(contact.uid).get());
            });
            const usersRes = await Promise.all(promisesArr);

            const users = usersRes.map(userRes => {
                const users = userRes.docs.map(res => res.data());
                return users;
            });
            const contactsList = flatten(users)
            contactsList.push(authUser);

            setEnrichedContacts(contactsList);
            setIsLoading(false);
        }
        getCurrentChatUsersDetails();
    }, []);

    const renderContacts = () => {
        return enrichedContacts.map(contact => {
            const { chosenDisplayName, displayName, email, lastSeen, photoURL, uid } = contact;
            return <Contact key={contact.uid}>
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
        });
    }

    return (
        <Container>

            {isLoading ? <Loader /> : null}

            <Top>
                <CloseIcon onClick={() => setIsContactInfoScreenVisible(false)} style={{marginRight: '10px', cursor: 'pointer'}} />
                <h2>Chat Info</h2>
            </Top>

            <Main>
                <AvatarWrapper>
                    <Avatar size={'big'} name={'G'} />
                </AvatarWrapper>

                {!enrichedContacts || !enrichedContacts.length ? null : <NumOfParticipants>{enrichedContacts.length} participants</NumOfParticipants>}
                {!enrichedContacts || !enrichedContacts.length ? null : renderContacts()}
            </Main>

        </Container>
    )
}

export default ContactsInfo;

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
    height: 60px;
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

const Contact = styled.div`
    display: flex;
    align-items: center;
    width: 90%;
    padding: 10px;
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

const NumOfParticipants = styled.p`
    font-size: 15px;
`;