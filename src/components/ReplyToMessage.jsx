import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import {Close as CloseIcon} from '@mui/icons-material';

function ReplyToMessage({setIsReplyMode}) {
    const authUser = useSelector(state => state.authUserDetails.value);
    const currentChatUsers = useSelector(state => state.currentChatUsers.value);
    const currentReplyMessage = useSelector(state => state.currentReplyMessage.value);
    const [currentReplyMessageSenderName, setCurrentReplyMessageSenderName] = useState(null);
    
    useEffect(() => {
        const getUserNameOfSender = () => {
            const users = [authUser, ...currentChatUsers];
            const sender = users.filter(user => user.uid === currentReplyMessage.senderId);
            if (!sender || !sender.length) {
                return;
            }
            setCurrentReplyMessageSenderName(sender[0].chosenDisplayName || sender[0].displayName);
        }
        if (currentReplyMessage) {
            getUserNameOfSender();
        }
    }, [currentReplyMessage])

    return (
        <Container>
            <Wrapper>
                <Left>
                    <Name>{currentReplyMessageSenderName}</Name>
                    <Text>{!currentReplyMessage ? null : currentReplyMessage.text}</Text>
                </Left>

                <Right>
                    <CloseElement onClick={() => setIsReplyMode(false)} />
                </Right>
            </Wrapper>
        </Container>
    )
}

export default ReplyToMessage;

const Container = styled.div`
    background: #151f2b;
    height: 85px;
    width: 100%;
    margin: 0 auto;
    position: absolute;
    bottom: 60px;
`;

const Wrapper = styled.div`
    width: 90%;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Left = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
    padding: 8px 20px;
    border-radius: 5px;
    background: #131c21;
    height: 44px;
    &:after {
        content: "";
        background: #35cd96;
        position: absolute;
        left: 0;
        top: 0;
        height: 60px;
        width: 4px;
        flex: none;
        border-top-left-radius: 7.5px;
        border-bottom-left-radius: 7.5px;
    }
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
        margin-left: 30px;
    }
`;

const CloseElement = styled(CloseIcon)`
    color: #b0b3b5;
`;
