import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase';
import { intersection } from 'lodash';
import styled from 'styled-components';
import { generateRandomString, addDatesSeparatorsToMessagesList } from '../services/commonService';
import firebaseService from '../services/firebase/service';
import {setCurrentChatId} from '../redux/currentChatId';
import {setCurrentChatUser} from '../redux/currentChatUser';
import { useSelector, useDispatch } from 'react-redux';

import { Message, DateBetweenMessages, EmptyState, Loader, CurrentChatInfo, ContactInfo, ChatInput, ReplyToMessage } from '.';

function Chat() {
    const authUser = useSelector(state => state.authUserDetails.value);
    const currentChatId = useSelector(state => state.currentChatId.value);
    const currentChatUser = useSelector(state => state.currentChatUser.value);
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
        if (currentChatUser && !currentChatId) {
            fetchChatId([authUser.uid, currentChatUser.uid]);
        }
        async function fetchChatId(participnatsIds) {
            setIsLoading(true);
            const promisesArr = [];
            participnatsIds.forEach(participnatsId => promisesArr.push(firebaseService.fetchChatId(participnatsId)));
            const participnatsChatsRes = await Promise.all(promisesArr);

            const arrOfChatsArrs = [];
            participnatsChatsRes.forEach(chat => arrOfChatsArrs.push(chat.docs.map(doc => doc.id)));
            const chatIdsArr = intersection(...arrOfChatsArrs);
            let chatId = chatIdsArr && chatIdsArr.length ? chatIdsArr[0] : null; // means no chat id already - set a new one

            if (!chatId) {
                chatId = generateRandomString(20);
                await firebaseService.setupChat(chatId, [authUser.uid, currentChatUser.uid]);
            }
            dispatch(setCurrentChatId(chatId));
            setIsLoading(false);
        }
    }, [currentChatUser, currentChatId, authUser, dispatch]);

    useEffect(() => { // this effect is for populating the current chat messages
        if (!currentChatUser || !currentChatId) {
            setChatMessages([]);
            return;
        }

        setIsLoading(true);
        if (isThreadMode) {
            firebaseService.getThreadMessages(currentChatId, messageIdForThread).onSnapshot(snapshot => {
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
            firebaseService.getMessages(currentChatId).onSnapshot(snapshot => {
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
    }, [authUser, currentChatId, isThreadMode, messageIdForThread]);

    useEffect(() => { // this effect marks messages read
        if (!authUser || !currentChatId || isThreadMode) {
            return;
        }
        firebaseService.markMessagesReadInConversation(authUser.uid, currentChatId);
    }, [authUser, currentChatId, isThreadMode]);

    useEffect(() => { // this effect removeing thread mode when changing currentChatId or currentChatUser
        setIsThreadMode(false);
    }, [currentChatId, currentChatUser]);

    useEffect(() => scrollToBottomOfChat, [chatMessages]); // to scroll down after each messages state update

    const scrollToBottomOfChat = () => {
        setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}, 1);
    }

    const sendMessage = (e, text) => {
        if (isEditMode) {
            return editMessage(e, isThreadMode, {chatId: currentChatId, messageIdForThread, messageId: messageIdToEdit, newText: text});
        }
        const newMessage = {
            chatId: currentChatId,
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
        if (isThreadMode) {
            firebaseService.sendThreadMessage(authUser.uid, newMessage, [authUser.uid, currentChatUser.uid]);
        } else {
            firebaseService.sendMessage(authUser.uid, newMessage, [authUser.uid, currentChatUser.uid]);
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
        await firebaseService.deleteChat(currentChatId);
        dispatch(setCurrentChatUser(null));
        dispatch(setCurrentChatId(null));
    }

    return (
        <Container>

            <MainContainer>
                <CurrentChatInfo isThreadMode={isThreadMode} setIsContactInfoScreenVisible={setIsContactInfoScreenVisible}
                    unsetThreadMode={() => setIsThreadMode(false)} deleteChat={handleDeleteChat}/>

                {isLoading ? <Loader /> : <Main>
                    {chatMessages.length < 1 || !currentChatUser ? <EmptyState currentChatUser={currentChatUser} /> : <ChatContainer>
                        {chatMessages.map(message => {
                            if (message.isDateBetweenMessages) {
                                return <DateBetweenMessages key={message.date} date={message.date} />;
                            }
                            return (
                                <Message
                                    key={message.id}
                                    authUser={authUser}
                                    currentChatUser={currentChatUser}
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

                {!currentChatUser ? null : <ChatInput
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

            {!isContactInfoScreenVisible ? null : <ContactInfo 
                setIsContactInfoScreenVisible={setIsContactInfoScreenVisible} />}

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
