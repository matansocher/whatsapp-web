import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// import * as _ from 'lodash';

import firebaseService from '../services/firebase/service';
import { getTimeFromSeconds } from '../services/commonService';
import {setCurrentChat} from '../redux/currentChat';
import {setCurrentChatUsers} from '../redux/currentChatUsers';
import { useDispatch, useSelector } from 'react-redux';

import { Avatar } from '.';
import {Menu, MenuItem, ListItemText, ListItemIcon} from '@mui/material';
import {FiberManualRecord as FiberManualRecordIcon, Delete as DeleteIcon, PushPin as PushPinIcon, MarkChatUnread as MarkChatUnreadIcon, KeyboardArrowDown as KeyboardArrowDownIcon} from '@mui/icons-material';

function ChatsListItem({conversation}) {

    const{id: chatId, lastMessageTime, users, isPinned, typingUsers, isGroup, groupSubject } = conversation;
    const authUser = useSelector(state => state.authUserDetails.value);
    const currentChatUsers = useSelector(state => state.currentChatUsers.value);
    const currentChat = useSelector(state => state.currentChat.value);
    const dispatch = useDispatch();

    const [isHovered, setIsHovered] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const [amountOfUnreadMessages, setAmountOfUnreadMessages] = useState(false);

    useEffect(() => {
        const listenToConversationsArrChanges = () => {
            firebaseService.getMessagesUnreadInConversationCount(chatId).onSnapshot(snapshot => {
                let docsArr = snapshot.docs.map(doc => {
                    return { id: doc.id, ...doc.data() };
                });

                let unreadMessagesObj = docsArr.find(doc => doc.id === authUser.uid);
                if (unreadMessagesObj && !isNaN(unreadMessagesObj.count)) {
                    setAmountOfUnreadMessages(unreadMessagesObj.count);
                }
            });
        }
        if (chatId) {
            listenToConversationsArrChanges();
        }
    }, [authUser, chatId]);

    const getContainerClass = () => {
        const classes = [];
        const isSelected = currentChat && currentChat.id === chatId;
        if (isHovered) classes.push('hovered-chat-list');
        if (isSelected) classes.push('selected-chat-list');
        if (classes.length > 1) return 'selected-chat-list'
        return classes.join(' ');
    }

    const handleClick = (e) => {
        dispatch(setCurrentChatUsers(users));
        dispatch(setCurrentChat(conversation));
    }

    const handlePinChat = async (e) => {
        firebaseService.pinChat(authUser.uid, chatId)
        setAnchorEl(null);
    }

    const handleUnpinChat = async (e) => {
        firebaseService.unpinChat(authUser.uid, chatId)
        setAnchorEl(null);
    }

    const handleMarkUnread = async (e) => {
        firebaseService.markChatUnread(authUser.uid, chatId);
        setAnchorEl(null);
    }

    const handleDeleteChat = async (e) => {
        setAnchorEl(null);
        await firebaseService.deleteChat(chatId);
        if (currentChat && currentChat.id === chatId) {
            dispatch(setCurrentChatUsers([]));
            dispatch(setCurrentChat(null));
        }
    }

    const renderTypingOrLastMessageTime = () => {
        if (typingUsers && typingUsers.length) {
            const typingUsersStr = typingUsers.join(', ');
            return <p>{typingUsersStr} typing...</p>;
        }
        if (lastMessageTime) {
            return <p>{getTimeFromSeconds(lastMessageTime.seconds)}</p>;
        }
    }

    const getNames = () => {
        if (!users || !users.length) {
            return;
        }
        if (isGroup) {
            return groupSubject;
        }
        const currentChatUsersNames = users
            .map(currentChatUser => currentChatUser.chosenDisplayName || currentChatUser.displayName)
            .sort()
            .join(', ');
        return currentChatUsersNames;
    }

    return (
        <Container 
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={getContainerClass()}>

            {isHovered ? <MoreOptionsIcon onClick={(e) => setAnchorEl(e.currentTarget)} /> : null}

            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={() => setAnchorEl(null)}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}>
                {isPinned ? <MenuItem onClick={handleUnpinChat}>
                    <ListItemIcon>
                        <PushPinIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Unpin Chat</ListItemText>
                </MenuItem> : 
                <MenuItem onClick={handlePinChat}>
                    <ListItemIcon>
                        <PushPinIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Pin Chat</ListItemText>
                </MenuItem>}
                <MenuItem onClick={handleMarkUnread}>
                    <ListItemIcon>
                        <MarkChatUnreadIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Mark Unread</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeleteChat}>
                    <ListItemIcon>
                        <DeleteIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Delete Chat</ListItemText>
                </MenuItem>
            </Menu>

            <Image>
                <Avatar name={users && users.length === 1 ? users[0].chosenDisplayName || users[0].displayName || users[0].email : 'G'} />
                {users && users.length === 1 && users[0].lastSeen === 'Online' ? <FiberManualRecordIcon /> : null}
            </Image>

            <Content>
                <ContentLeft>
                    <h2>{getNames()}</h2>
                </ContentLeft>
                <ContentRight>
                    {renderTypingOrLastMessageTime()}
                    <ContentRightBottom>
                    {amountOfUnreadMessages ? <Badge>{amountOfUnreadMessages}</Badge> : null}
                        {isPinned ? <PushPinIcon fontSize='small' /> : null}
                    </ContentRightBottom>
                </ContentRight>
            </Content>

        </Container>
    )
}

export default ChatsListItem;

const Container = styled.div`
    flex: 0.4;
    height: 50px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    flex-direction: row;
    position: relative;
    cursor: pointer;
    padding: 0.5625rem;
    overflow: hidden;

    h2 {
        font-size: 16px;
    }
`;

const MoreOptionsIcon = styled(KeyboardArrowDownIcon)`
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
`;

const Image = styled.div`
    position: relative;
    display: flex;

    img {
        width: 40px;
        font-size: 15px;
        font-weight: 900;
        border-radius: 50%;
    }

    svg {
        position: absolute;
        color: #34e934;
        bottom: -5px;
        right: -5px;
    }
`;

const Content = styled.div`
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;

    > h2 {
        font-size: 15px;
        font-weight: 900;
    }

    > h3 {
        display: flex;
        font-size: 13px;
        font-weight: 400;
        align-items: center;
    }

    > h3 > .MuiSvgIcon-root {
        font-size: 14px;
        margin-top: 1px;
        margin-right: 1px;
        color: green;
    }
`;

const ContentLeft = styled.div`
    
`;

const ContentRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    p {
        font-size: 14px;
    }
`;

const ContentRightBottom = styled.div`
    display: flex;
    align-items: center;
`;

const Badge = styled.div`
    width: 22px;
    height: 22px;
    background-color: #707579;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #f3f3f3;
    font-size: 13px;
    margin-top: 5px;
`;
