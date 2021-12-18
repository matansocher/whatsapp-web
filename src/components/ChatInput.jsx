import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import firebaseService from '../services/firebase/service';
import { useSelector } from 'react-redux';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import {Menu, MenuItem, ListItemText, ListItemIcon} from '@mui/material';
import {Mood as MoodIcon, Attachment as AttachmentIcon, Send as SendIcon, Photo as PhotoIcon} from '@mui/icons-material';

function ChatInput({isEditMode, setIsEditMode, editMessageText, isThreadMode, setMessageIdToEdit, messageIdForThread, sendMessage, editMessage}) {
    const authUser = useSelector(state => state.authUserDetails.value);
    const currentChatId = useSelector(state => state.currentChatId.value);

    const messageInput = useRef(null);
    const [typingIntervalId, setTypingIntervalId] = useState(null);

    const [isEmojiWindowOpen, setIsEmojiWindowOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    useEffect(() => { // listening to isEditMode change, and if true, set value inside input
        if (!editMessageText) {
            return;
        }
        messageInput.current.value = editMessageText;
        setTimeout(() => {
            messageInput.current.focus();
        }, 200);
    }, [editMessageText]);

    const handleSendMessage = (e) => {
        const text = messageInput.current.value.trim();
        sendMessage(e, text);
        messageInput.current.value = '';
    }

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && messageInput.current.value) {
            return handleSendMessage(e);
        }
        if (e.key === 'Escape' && isEditMode) {
            setIsEditMode(false);
            setMessageIdToEdit(null);
            return messageInput.current.value = '';
        }
        setTyping();
    }

    const setTyping = async () => {
        if (typingIntervalId) {
            clearTimeout(typingIntervalId);
            setTypingIntervalId(null);
        } else {
            await firebaseService.setTyping(authUser.uid, currentChatId);
        }
        const intervalId = setTimeout(() => {
            stopTyping();
            setTypingIntervalId(null);
        }, 4000);
        setTypingIntervalId(intervalId);
    }

    const stopTyping = async () => {
        firebaseService.stopTyping(authUser.uid, currentChatId);
    }

    const handlePhotosAndVideos = () => {
        setAnchorEl(null);
    }

    const handleOnEmojiSelect = (emoji, e) => {
        messageInput.current.value = messageInput.current.value + emoji.native;
        setIsEmojiWindowOpen(false);
    }

    return (
        <Container>
            <Left>
                <EmojiContainer>
                    <MoodIcon onClick={() => setIsEmojiWindowOpen(!isEmojiWindowOpen)} style={{ color: '#b0b3b5', cursor: 'pointer' }} />
                    {!isEmojiWindowOpen ? null : <Picker
                        onClick={handleOnEmojiSelect}
                        theme='dark' title='Pick your emoji…'
                        emoji='point_up'
                        style={{ position: 'absolute', bottom: '40px', left: '0px' }} />}
                </EmojiContainer>

                <AttachmentIcon onClick={(e) => setAnchorEl(e.currentTarget)} />

                <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={() => setAnchorEl(null)}
                    MenuListProps={{ 'aria-labelledby': 'basic-button' }}>
                    <MenuItem onClick={handlePhotosAndVideos} className='relative'>
                        <ListItemIcon>
                            <PhotoIcon fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Photos & Videos</ListItemText>
                    </MenuItem>
                </Menu>
            </Left>

            <InputWrapper>
                <Input
                    placeholder='Type a message'
                    name='message'
                    ref={messageInput}
                    autoComplete='off'
                    onKeyDown={handleInputKeyDown} />
            </InputWrapper>

            <Right>
                <SendIconElement onClick={handleSendMessage} />
            </Right>

        </Container>
    )
}

export default ChatInput;

const Container = styled.div`
    height: 60px;
    width: 95%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    > svg {
        width: 30px;
        height: 30px;
        white-space: nowrap;
        top: 10px;
        left: 50px;
        color: #b0b3b5;
        cursor: pointer;
        margin-left: 10px;
    }
`;

const EmojiContainer = styled.div`
    position: relative;
`;

const InputWrapper = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
`;

const Input = styled.input`
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80%;
    position: relative;
    border-radius: 24px;
    padding: 0px 10px 0px 15px;
    border: none;
    outline: none;
    font-size: 15px;
    color: #d4d5d7;
    background-color: #323739;
    font-weight: 400;

    /* ::placeholder {
        color: #fdfdfd;
    } */
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    > svg {
        width: 30px;
        height: 30px;
        white-space: nowrap;
        top: 10px;
        left: 50px;
        color: #b0b3b5;
        cursor: pointer;
        margin-left: 10px;
    }
`;

const SendIconElement = styled(SendIcon)`
    color: #b0b3b5;
`;
