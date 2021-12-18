import React from 'react';
import styled from 'styled-components';

function Header({ currentChatUser }) {
    const text = currentChatUser && (currentChatUser.displayName || currentChatUser.email) ? 
    `This is the very beginning of your direct message history with ${currentChatUser.displayName || currentChatUser.email}` : 
    `Whatsapp Web`;
    return (
        <Container>
            <p>{text}</p>
        </Container>
    )
}

export default Header;

const Container = styled.div`
    display: flex;
    position: fixed;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    background-color: #152b40;
    color: #ffffff;
`;
