import React, {useState} from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { getLastSeenString } from '../services/commonService';

import { Avatar } from '.';
import {Menu, MenuItem, ListItemText, ListItemIcon} from '@mui/material';
import SearchIcon from '@material-ui/icons/Search';
import {MoreVert as MoreVertIcon, Person as PersonIcon, CheckBox as CheckBoxIcon, Delete as DeleteIcon, Backspace as BackspaceIcon, ArrowBack as ArrowBackIcon} from '@mui/icons-material';

function CurrentChatInfo({isThreadMode, setIsContactInfoScreenVisible, unsetThreadMode, deleteChat}) {

    const currentChatId = useSelector(state => state.currentChatId.value);
    const currentChatUser = useSelector(state => state.currentChatUser.value);

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleContactInfo = () => {
        setIsContactInfoScreenVisible(true);
        setAnchorEl(null);
    }

    const searchMessages = () => {
        setAnchorEl(null);
    }

    const handleDeleteChat = async () => {
        deleteChat(currentChatId);
        setAnchorEl(null);
    }

    return (
        <Container>
            <Left>
                {currentChatUser && isThreadMode ? <ArrowBackIcon onClick={unsetThreadMode} style={{marginRight: '10px', cursor: 'pointer'}} /> : null}
                {!currentChatUser ? null : <>
                <Avatar photo={currentChatUser.photoURL} name={currentChatUser.displayName || currentChatUser.email} />
                <Content onClick={handleContactInfo}>
                    <Name>{currentChatUser.displayName || currentChatUser.email}</Name>
                    <LastSeen>{getLastSeenString(currentChatUser.lastSeen)}</LastSeen>
                </Content></>}
            </Left>

            {!currentChatUser ? null : <Right>
                <SearchIcon onClick={searchMessages} />
                <MoreVertIcon onClick={(e) => setAnchorEl(e.currentTarget)} />

                <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={() => setAnchorEl(null)}
                    MenuListProps={{ 'aria-labelledby': 'basic-button' }}>
                    <MenuItem onClick={handleContactInfo}>
                        <ListItemIcon>
                            <PersonIcon fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Contact Info</ListItemText>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon>
                            <CheckBoxIcon fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Select Messages</ListItemText>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon onClick={handleDeleteChat}>
                            <DeleteIcon fontSize='small' />
                        </ListItemIcon>
                        <ListItemText>Delete Chat</ListItemText>
                    </MenuItem>
                </Menu>
            </Right>}
        </Container>

    )
}

export default CurrentChatInfo;

const Container = styled.div`
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px 20px;

    p {
        flex: 1 1 auto;
        padding-left: 10px;
        max-width: 100%;
        overflow: hidden;
    }
`;


const Left = styled.div`
    display: flex;
    align-items: center;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    cursor: pointer;
    font-weight: 500;
`;

const Name = styled.p`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 16px;
    color: #e1e2e3;
`;

const LastSeen = styled.p`
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #d4d5d7;
    font-size: 13px;
    font-weight: 400;
`;

const Right = styled.div`
    display: flex;
    align-items: center;

    > svg {
        margin-left: 10px;
        cursor: pointer;
    }
`;
