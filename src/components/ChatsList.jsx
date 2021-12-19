import React, { useState, useEffect } from 'react';
import { uniq, flatten } from 'lodash';
import styled from 'styled-components';

import firebaseService from '../services/firebase/service';
import { useSelector } from 'react-redux';

import { sortChatsListByPinned } from '../services/commonService';
import { ChatsListItem, Loader } from '.';
import {Search as SearchIcon} from '@material-ui/icons';

function ChatsList() {

    const authUser = useSelector(state => state.authUserDetails.value);
    const [conversationsArr, setConversationsArr] = useState([]);
    const [searchResultsArr, setSearchResultsArr] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { // this effect is for populating the chats list items
        setIsLoading(true);
        firebaseService.getConversations(authUser.uid).onSnapshot(async snapshot => {

            let conversationsArr = snapshot.docs.map(doc => {
                return { id: doc.id, ...doc.data() };
            });

            conversationsArr = conversationsArr.map(conversation => {
                return {
                    id: conversation.id,
                    lastMessageTime: conversation.lastMessageTime,
                    participantsIds: uniq(conversation.participants.filter(participantUid => participantUid !== authUser.uid)),
                    pinnedFor: conversation.pinnedFor,
                    typing: conversation.typing,
                    isGroup: conversation.isGroup,
                    groupSubject: conversation.groupSubject
                }
            });

            const uniqueUids = uniq(flatten(conversationsArr.map(conversation => conversation.participantsIds)));
            if (!uniqueUids || !uniqueUids.length) {
                setIsLoading(false);
                return;
            }
            const users = await firebaseService.getChatsUsers(uniqueUids);
            const userRecords = users.docs.map(doc => doc.data());

            conversationsArr = conversationsArr.map(conversation => {
                const { id, lastMessageTime, participantsIds, pinnedFor, typing, isGroup, groupSubject } = conversation;
                const users = participantsIds.map(participantsId => {
                    return userRecords.find(userRecord => userRecord.uid === participantsId);
                });
                const isPinned = pinnedFor ? pinnedFor.includes(authUser.uid) : false;
                const typingUsers = typing && typing.length ? typing.filter(userId => userId !== authUser.uid) : null;
                return {
                    id,
                    lastMessageTime,
                    users,
                    isPinned,
                    typingUsers,
                    isGroup,
                    groupSubject
                }
            });

            conversationsArr = sortChatsListByPinned(conversationsArr);
            if (conversationsArr && conversationsArr.length > 0) {
                setConversationsArr(conversationsArr);
            }
            setIsLoading(false);
        });
    }, [authUser]);

    const searchUsers = async (e) => {
        const searchInput = e.target.value;
        if (!searchInput) {
            setSearchResultsArr([]);
            return;
        }

        setIsLoading(true);
        const res = await firebaseService.searchUsers(searchInput.toLowerCase());
        let usersSearchResults = res.docs.map(doc => doc.data());
        if (!usersSearchResults || !usersSearchResults.length) {
            setIsLoading(false);
            return;
        }
        usersSearchResults = usersSearchResults
            .filter(usersSearchResult => usersSearchResult.uid !== authUser.uid)
            .map(usersSearchResult => {
                return { chatId: null, users: [usersSearchResult] }
            });
        setSearchResultsArr(usersSearchResults);
        setIsLoading(false);
    }

    const renderSearchResults = () => {
        return searchResultsArr.map(conversation => {
            return <ChatsListItem key={conversation.id} conversation={conversation} />;
        })
    }

    const renderChatsList = () => {
        return conversationsArr.map(conversation => {
            return <ChatsListItem key={conversation.id} conversation={conversation} />;
        })
    }

    return (
        <Container>

            <SearchContainer>
                <SearchIconDiv />
                <SearchInput placeholder='Search' onChange={searchUsers} />                    
            </SearchContainer>

            <Divider />

            { isLoading ? <Loader /> : 
                <ContainerList>
                    {searchResultsArr && searchResultsArr.length ? renderSearchResults() : renderChatsList()}
                </ContainerList>
            }

        </Container>
    )
}

export default ChatsList;

const Container = styled.div`
    background-color: #15202b;
    overflow: hidden;
    height: calc(100vh - 75px);
    padding-top: 10px;
`;

const ContainerList = styled.div`
    height: calc(100vh - 56px);
    overflow: scroll;
`;

const Divider = styled.div`
    height: 1px;
    background: #323739;
    margin-top: 10px;
`;

const SearchContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    padding: 0 20px;
`;

const SearchInput = styled.input`
    font-size: 15px;
    color: #d4d5d7;
    background-color: #323739;
    font-weight: 400;
    width: 100%;
    height: 40px;
    border-radius: 20px;
    border: none;
    outline: none;
    padding: 0px 10px;
    padding-left: 40px;
`;

const SearchIconDiv = styled(SearchIcon)`
    position: absolute;
    white-space: nowrap;
    top: 10px;
    left: 30px;
    color: #b0b3b5;
`;
