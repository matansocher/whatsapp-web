import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { getMessageTimeFromSeconds, getThreadPreviewText } from '../services/commonService';
import firebaseService from '../services/firebase/service';
import {setCurrentReplyMessage} from '../redux/currentReplyMessage';
import {Loader} from '.';

import {Reply as ReplyIcon, KeyboardArrowDown as KeyboardArrowDownIcon, Delete as DeleteIcon, Star as StarIcon, Done as DoneIcon, Edit as EditIcon, ChevronRight as ChevronRightIcon} from '@mui/icons-material';
import {Menu, MenuItem, ListItemText, ListItemIcon} from '@mui/material';

function Message({ authUser, currentChatUsers, message, isThreadMessage = false, deleteMessage, setMessageIdForThread, setIsThreadMode, setIsEditMode, setMessageIdToEdit, setEditMessageText, setIsLoading, setIsReplyMode, scrollToBottomOfChat }) {
    const { id: messageId, chatId, senderId, time, text, messageIdForThread, isMainThreadMessage = false, edited = false, messageIdReplyingTo } = message;
    const niceTime = getMessageTimeFromSeconds(time ? time.seconds : null);
    const isSentByAuthUser = senderId === authUser.uid;

    const starredMessagesIds = useSelector(state => state.starredMessagesIds.value);
    const dispatch = useDispatch();

    const [isMessageLoading, setIsMessageLoading] = useState(null);
    const [replyMessage, setReplyMessage] = useState(null);
    const [amountOfUnreadMessages, setAmountOfUnreadMessages] = useState(false);
    const [numberOfThreadMessages, setNumberOfThreadMessages] = useState([]);
    const [isMessageStarred, setIsMessageStarred] = useState(starredMessagesIds.includes(messageId));
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    useEffect(() => { // this effect is for populating the current number of thread messages for this message
        if (isThreadMessage) {
            return;
        }
        setNumberOfThreadMessages([]);
        firebaseService.getThreadMessages(chatId, messageId).onSnapshot(snapshot => {
            const threadMessagesArr = snapshot.docs.map(doc => {
                const threadMessageData = doc.data();
                return { id: doc.id, ...threadMessageData };
            });

            if (threadMessagesArr && threadMessagesArr.length > 0) {
                setNumberOfThreadMessages(threadMessagesArr);
            }
        });
    }, [chatId, messageId, isThreadMessage]);

    useEffect(() => { // this effect is updating the thread messages count in real time
        const listenToConversationsArrChanges = () => {
            firebaseService.getMessagesUnreadInThreadCount(chatId, messageId).onSnapshot(snapshot => {
                let docsArr = snapshot.docs.map(doc => {
                    return { id: doc.id, ...doc.data() };
                });

                let unreadMessagesObj = docsArr.find(doc => doc.id === authUser.uid);
                if (unreadMessagesObj && !isNaN(unreadMessagesObj.count)) {
                    setAmountOfUnreadMessages(unreadMessagesObj.count);
                }
            });
        }
        listenToConversationsArrChanges();
    }, [authUser, chatId, messageId]);

    useEffect(() => {
        const isMessageStarred = starredMessagesIds.includes(messageId);
        setIsMessageStarred(isMessageStarred);
    }, [starredMessagesIds, messageId]);

    useEffect(async () => {
        if (!chatId || !messageIdReplyingTo) {
            return;
        }
        setIsMessageLoading(true);
        const messageReplyingToRes = await firebaseService.getMessage(chatId, messageIdReplyingTo);
        const replyMessage = messageReplyingToRes.data();
        if (!replyMessage) {
            setIsMessageLoading(false);
            return;
        }

        const users = [authUser, ...currentChatUsers];
        const sender = users.filter(user => user.uid === replyMessage.senderId);
        if (!sender || !sender.length) {
            setIsMessageLoading(false);
            return;
        }
        replyMessage.senderName = sender[0].chosenDisplayName || sender[0].displayName;
        setReplyMessage(replyMessage);
        scrollToBottomOfChat();
        setIsMessageLoading(false);
    }, [chatId]);

    const handleStarMessage = async (e) => {
        const message = { chatId, messageId };
        if (isThreadMessage) {
            message.messageId = messageIdForThread;
            message.threadMessageId = messageId;
        }
        setAnchorEl(null);
        setIsMessageLoading(true);
        if (isMessageStarred) {
            await firebaseService.removeStarredMessage(authUser.uid, message);
        } else {
            await firebaseService.starMessage(authUser.uid, message);
        }
        setIsMessageLoading(false);
    }

    const handleEditMessage = (e) => {
        setIsEditMode(true);
        setMessageIdToEdit(messageId);
        setEditMessageText(text);
        setAnchorEl(null);
    }

    const handleDeleteMessage = async (e) => {
        setAnchorEl(null);
        console.log('start');
        setIsMessageLoading(true);
        await deleteMessage(e, isThreadMessage, {chatId, messageIdForThread, messageId});
        console.log('end');
        setIsMessageLoading(false);
    }

    const handleReplyClick = () => {
        dispatch(setCurrentReplyMessage(message));
        setIsReplyMode(true);
        setAnchorEl(null);
    }

    const goIntoThread = async () => {
        setIsLoading(true);
        const currentChatUsersIds = currentChatUsers.map(user => user.uid);
        await firebaseService.makeSureThreadIsSetup(chatId, messageId, [authUser.uid, ...currentChatUsersIds]);
        firebaseService.markMessagesReadInThread(authUser.uid, chatId, messageId);
        setIsLoading(false)
        setMessageIdForThread(messageId);
        setIsThreadMode(true);
        setIsReplyMode(false);
    }

    const getContainerClass = () => {
        const classes = [];
        if (isSentByAuthUser) classes.push('message-sent');
        if (!isSentByAuthUser) classes.push('message-received');
        if (isMainThreadMessage) classes.push('main-thread-message');
        return classes.join(' ');
    }

    const getNames = () => {
        const userMssageSentFrom = [authUser, ...currentChatUsers].find(user => user.uid === senderId);
        if (userMssageSentFrom) {
            return userMssageSentFrom.chosenDisplayName || userMssageSentFrom.displayName || userMssageSentFrom.email;
        }
    }

    return (
        <Container className={getContainerClass()}>

            {!isMessageLoading ? null : <Loader isCenteredOnParentDiv={true}  />}
            <MoreOptionsIcon onClick={(e) => setAnchorEl(e.currentTarget)} style={{zIndex: 9}} />

            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={() => setAnchorEl(null)}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}>
                {isThreadMessage ? null : <MenuItem onClick={handleReplyClick}>
                    <ListItemIcon>
                        <ReplyIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Reply</ListItemText>
                </MenuItem>}
                <MenuItem onClick={handleStarMessage}>
                    <ListItemIcon>
                        <StarIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>{isMessageStarred ? 'Unstar Message' : 'Star Message'}</ListItemText>
                </MenuItem>
                {!isSentByAuthUser ? null : <MenuItem onClick={handleEditMessage}>
                    <ListItemIcon>
                        <EditIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Edit Message</ListItemText>
                </MenuItem>}
                {!isSentByAuthUser ? null : <MenuItem onClick={handleDeleteMessage}>
                    <ListItemIcon>
                        <DeleteIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>Delete Message</ListItemText>
                </MenuItem>}
            </Menu>

            {!messageIdReplyingTo || !replyMessage ? null : <ReplyContainer>
                <ReplyPreview>
                    <ReplyName>{replyMessage.senderName}</ReplyName>
                    <ReplyText>{!replyMessage ? null : replyMessage.text}</ReplyText>
                </ReplyPreview>

                </ReplyContainer>}

            <MessageContent>
                <Name>{getNames()}</Name>
                <Text>
                    {text}
                    {edited ? <HasEdited> edited</HasEdited> : null}
                </Text>
                <Time>
                    {!isMessageStarred ? null: <StarIcon fontSize='small' />}
                    <p>{niceTime}</p>
                    {<DoneIcon fontSize='small' />}
                </Time>
            </MessageContent>

            {isThreadMessage ? null : <ThreadContainer>
                <ThreadPreview onClick={goIntoThread}>
                    <p>{getThreadPreviewText(numberOfThreadMessages)}</p>
                    {amountOfUnreadMessages ? <Badge>{amountOfUnreadMessages}</Badge> : null}
                    <ChevronRightIcon />
                </ThreadPreview>

                </ThreadContainer>}

        </Container>
    )
}

export default Message;

const Container = styled.div`
    position: relative;
    max-width: 500px;
    margin: 6px 14px;
    border-radius: 7px;
`;

const MessageContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 7px 10px 5px;
`;

const MoreOptionsIcon = styled(KeyboardArrowDownIcon)`
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
`;

const Name = styled.p`
    display: inline-flex;
    max-width: 100%;
    font-size: 12.8px;
    font-weight: 500;
    line-height: 22px;
    color: #35cd96;
`;

const Text = styled.p`
    color: rgba(241,241,242,0.95);
    overflow: hidden;
`;

const HasEdited = styled.span`
    color: #bfbfbf;
    overflow: visible;
    font-size: 12px;
    font-style: italic;
    margin-right: 5px;
`;

const Time = styled.div`
    display: flex;
    align-items: center;
    align-self: flex-end;
    height: 15px;
    white-space: nowrap;
    float: right;
    margin-top: 4px;
    margin-left: 10px;
    color: rgba(241,241,242,0.63);
    p {
        font-size: 11px;
        line-height: 15px;
        margin: 0 3px;
    }
    .MuiSvgIcon-root {
        font-size: 15px;
    }
`;

const ReplyContainer = styled.div`
    position: relative;
    padding: 4px 8px;
    border-top: 1px solid #0f0f0f;
`;

const ReplyPreview = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
    padding: 8px 20px;
    border-radius: 5px;
    background: rgba(0,0,0, .2);
    padding: 3px 15px 3px 12px;
    height: 44px;
    &:after {
        content: "";
        background: #35cd96;
        position: absolute;
        left: 0;
        top: 0;
        height: 50px;
        width: 4px;
        flex: none;
        border-top-left-radius: 7.5px;
        border-bottom-left-radius: 7.5px;
    }
`;

const ReplyName = styled.p`
    display: inline-flex;
    max-width: 100%;
    font-size: 12.8px;
    font-weight: 500;
    line-height: 22px;
    color: #35cd96;
`;

const ReplyText = styled.p`
    color: rgba(241,241,242,0.95);
    overflow: hidden;
`;

const ThreadContainer = styled.div`
    position: relative;
    padding: 4px 8px;
    border-top: 1px solid #0f0f0f;
`;

const ThreadPreview = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    > p {
        font-size: 14px;
        line-height: 0;
        pointer-events: none;
    }

    > svg {
        width: 20px;
    }
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
