import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase';
import { intersection } from 'lodash';
import styled from 'styled-components';
import { generateRandomString, addDatesSeparatorsToMessagesList } from '../services/commonService';
import firebaseService from '../services/firebase/service';
import {setCurrentChat} from '../redux/currentChat';
import {setCurrentChatUsers} from '../redux/currentChatUsers';
import { useSelector, useDispatch } from 'react-redux';

import { Message, DateBetweenMessages, EmptyState, Loader, CurrentChatInfo, ContactInfo, ContactsInfo, ChatInput, ReplyToMessage } from '.';

function Chat() {
    const authUser = useSelector(state => state.authUserDetails.value);
    const currentChat = useSelector(state => state.currentChat.value);
    const currentChatUsers = useSelector(state => state.currentChatUsers.value);
    const currentReplyMessage = useSelector(state => state.currentReplyMessage.value);
    const dispatch = useDispatch();

    const [isReplyMode, setIsReplyMode] = useState(false);
    const [isThreadMode, setIsThreadMode] = useState(false);
    const [messageIdForThread, setMessageIdForThread] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [messageIdToEdit, setMessageIdToEdit] = useState(null);
    const [isContactInfoScreenVisible, setIsContactInfoScreenVisible] = useState(false);
    const [editMessageText, setEditMessageText] = useState('');

    const messagesEndRef = useRef(null)
    const [chatMessages, setChatMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { // this effect is trying to fetch chatId if null
        if (currentChatUsers && currentChatUsers.length && !currentChat) {
            const currentChatUsersIds = currentChatUsers.map(user => user.uid);
            fetchChat([authUser.uid, ...currentChatUsersIds]);
        }
        async function fetchChat(participnatsIds) { // $$$$$$$
            setIsLoading(true);
            const promisesArr = [];
            participnatsIds.forEach(participnatsId => promisesArr.push(firebaseService.fetchChat(participnatsId)));
            const participnatsChatsRes = await Promise.all(promisesArr);

            const arrOfChatsArrs = [];
            participnatsChatsRes.forEach(chat => arrOfChatsArrs.push(chat.docs.map(doc => doc.id)));
            const chatIdsArr = intersection(...arrOfChatsArrs);
            let chatId = chatIdsArr && chatIdsArr.length ? chatIdsArr[0] : null; // means no chat id already - set a new one

            if (!chatId) {
                chatId = generateRandomString(20);
                const currentChatUsersIds = currentChatUsers.map(user => user.uid);
                await firebaseService.setupChat(chatId, [authUser.uid, ...currentChatUsersIds]);
            }
            dispatch(setCurrentChat(chatId));
            setIsLoading(false);
        }
    }, [currentChatUsers, currentChat, authUser, dispatch]);

    useEffect(() => { // this effect is for populating the current chat messages
        if (!currentChatUsers || !currentChatUsers.length || !currentChat) {
            setChatMessages([]);
            return;
        }

        setIsLoading(true);
        if (isThreadMode) {
            firebaseService.getThreadMessages(currentChat.id, messageIdForThread).onSnapshot(snapshot => {
                if (snapshot.empty) {
                    setChatMessages([]);
                }

                const threadMessagesArr = snapshot.docs.map(doc => {
                    const threadMessageData = doc.data();
                    return { id: doc.id, ...threadMessageData };
                })

                const threadMessage = chatMessages.find(message => message.id === messageIdForThread); // the main meesage of the thread
                let threadMessages = []; // all thread messages including the main message
                if (threadMessagesArr && threadMessagesArr.length > 0) {
                    threadMessages = [{...threadMessage, isMainThreadMessage: true}, ...threadMessagesArr];
                } else { // no thread messages - show just the first message
                    threadMessages = [{...threadMessage, isMainThreadMessage: true}];
                }
                const messagesWithDatesSeparators = addDatesSeparatorsToMessagesList(threadMessages);
                setChatMessages(messagesWithDatesSeparators);
                setIsLoading(false);
            });
        } else {
            firebaseService.getMessages(currentChat.id).onSnapshot(snapshot => {
                if (snapshot.empty) {
                    setChatMessages([]);
                }
                const messagesArr = snapshot.docs.map(doc => {
                    const messageData = doc.data();
                    return { id: doc.id, ...messageData };
                });
    
                if (messagesArr && messagesArr.length > 0) {
                    const messagesWithDatesSeparators = addDatesSeparatorsToMessagesList(messagesArr);
                    setChatMessages(messagesWithDatesSeparators);
                }
                setIsLoading(false);
            });
        }
    }, [authUser, currentChat, isThreadMode, messageIdForThread]);

    useEffect(() => { // this effect marks messages read
        if (!authUser || !currentChat || !currentChat.id || isThreadMode) {
            return;
        }
        firebaseService.markMessagesReadInConversation(authUser.uid, currentChat.id);
    }, [authUser, currentChat, isThreadMode]);

    useEffect(() => { // this effect removeing thread mode when changing currentChat.id or currentChatUsers
        setIsThreadMode(false);
    }, [currentChat, currentChatUsers]);

    useEffect(() => scrollToBottomOfChat, [chatMessages]); // to scroll down after each messages state update

    const scrollToBottomOfChat = () => {
        setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}, 1);
    }

    const sendMessage = (e, text) => {
        if (isEditMode) {
            return editMessage(e, isThreadMode, {chatId: currentChat.id, messageIdForThread, messageId: messageIdToEdit, newText: text});
        }
        const newMessage = {
            chatId: currentChat.id,
            senderId: authUser.uid,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            text
        };
        if (isThreadMode) {
            newMessage.messageIdForThread = messageIdForThread;
        }
        if (isReplyMode) {
            newMessage.messageIdReplyingTo = currentReplyMessage.id;
        }

        const currentChatUsersIds = currentChatUsers.map(user => user.uid);
        if (isThreadMode) {
            firebaseService.sendThreadMessage(authUser.uid, newMessage, [authUser.uid, ...currentChatUsersIds]);
        } else {
            firebaseService.sendMessage(authUser.uid, newMessage, [authUser.uid, ...currentChatUsersIds]);
        }
        setIsReplyMode(false);
    }

    const editMessage = (e, isThreadMessage, {chatId, messageIdForThread, messageId, newText}) => {
        if (!newText) {
            return;
        }
        if (isThreadMessage) {
            firebaseService.editThreadMessage(chatId, messageIdForThread, messageId, newText);
        } else {
            firebaseService.editMessage(chatId, messageId, newText);
        }
        setIsEditMode(false);
        setMessageIdToEdit(null);
    }

    const deleteMessage = async (e, isThreadMessage, {chatId, messageIdForThread, messageId}) => {
        if (isThreadMessage) {
            await firebaseService.deleteThreadMessage(authUser.uid, chatId, messageIdForThread, messageId);
        } else {
            await firebaseService.deleteMessage(authUser.uid, chatId, messageId);
        }
    }

    const handleDeleteChat = async (e) => {
        await firebaseService.deleteChat(currentChat.id);
        dispatch(setCurrentChatUsers([]));
        dispatch(setCurrentChat(null));
    }

    return (
        <Container>

            <MainContainer>
                <CurrentChatInfo isThreadMode={isThreadMode} setIsContactInfoScreenVisible={setIsContactInfoScreenVisible}
                    unsetThreadMode={() => setIsThreadMode(false)} deleteChat={handleDeleteChat}/>

                {isLoading ? <Loader /> : <Main>
                    {chatMessages.length < 1 || !currentChatUsers || !currentChatUsers.length ? <EmptyState currentChatUsers={currentChatUsers} /> : <ChatContainer>
                        {chatMessages.map(message => {
                            if (message.isDateBetweenMessages) {
                                return <DateBetweenMessages key={message.date} date={message.date} />;
                            }
                            return (
                                <Message
                                    key={message.id}
                                    authUser={authUser}
                                    currentChatUsers={currentChatUsers}
                                    isThreadMessage={isThreadMode}
                                    setMessageIdForThread={setMessageIdForThread}
                                    setIsThreadMode={setIsThreadMode}
                                    deleteMessage={deleteMessage}
                                    setIsEditMode={setIsEditMode}
                                    setMessageIdToEdit={setMessageIdToEdit}
                                    setEditMessageText={() => setEditMessageText(message.text)}
                                    setIsLoading={setIsLoading}
                                    setIsReplyMode={setIsReplyMode}
                                    scrollToBottomOfChat={scrollToBottomOfChat}
                                    message={message} />
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </ChatContainer>}
                </Main>}

                {!currentChatUsers || !currentChatUsers.length ? null : <ChatInput
                    isEditMode={isEditMode}
                    editMessageText={editMessageText}
                    setIsEditMode={setIsEditMode}
                    isThreadMode={isThreadMode}
                    setMessageIdToEdit={setMessageIdToEdit}
                    messageIdForThread={messageIdForThread}
                    sendMessage={sendMessage}
                    editMessage={editMessage} />}

                {!isReplyMode ? null : <ReplyToMessage setIsReplyMode={setIsReplyMode} />}
            </MainContainer>

            {isContactInfoScreenVisible && currentChatUsers.length === 1 ? <ContactInfo 
                contacts={currentChatUsers}
                setIsContactInfoScreenVisible={setIsContactInfoScreenVisible} /> : null}

            {isContactInfoScreenVisible && currentChatUsers.length > 1 ? <ContactsInfo 
                contacts={currentChatUsers}
                setIsContactInfoScreenVisible={setIsContactInfoScreenVisible} /> : null}

        </Container>
    )
}

export default Chat;

const Container = styled.div`
    background-color: #15202b;
    overflow: hidden;
    height: 100vh;
    display: flex;
`;

const MainContainer = styled.div`
    position: relative;
    flex: 1;
`;

const Main = styled.div`
    height: calc(100vh - 120px);
    background-color: #152b40;
    overflow: scroll;
`;

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
`;
