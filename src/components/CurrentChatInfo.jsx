import React, {useState} from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import {setCurrentChatId} from '../redux/currentChatId';
import {setCurrentChatUsers} from '../redux/currentChatUsers';

import { getLastSeenString } from '../services/commonService';

import { Avatar } from '.';
import {Menu, MenuItem, ListItemText, ListItemIcon} from '@mui/material';
import SearchIcon from '@material-ui/icons/Search';
import {MoreVert as MoreVertIcon, Person as PersonIcon, CheckBox as CheckBoxIcon, Delete as DeleteIcon, Backspace as BackspaceIcon, ArrowBack as ArrowBackIcon} from '@mui/icons-material';

function CurrentChatInfo({isThreadMode, setIsContactInfoScreenVisible, unsetThreadMode, deleteChat}) {

    const authUser = useSelector(state => state.authUserDetails.value);
    const currentChatId = useSelector(state => state.currentChatId.value);
    const currentChatUsers = useSelector(state => state.currentChatUsers.value);
    const dispatch = useDispatch();

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
        await deleteChat(currentChatId);
        dispatch(setCurrentChatId(null));
        dispatch(setCurrentChatUsers([]));
        setAnchorEl(null);
    }

    const getNames = () => {
        const users = [authUser, ...currentChatUsers];
        const currentChatUsersNames = currentChatUsers.map(currentChatUser => {
            return currentChatUser.chosenDisplayName || currentChatUser.displayName || currentChatUser.email;
        }).join(' and ');
        return currentChatUsersNames;
    }

    const getLastSeenText = () => {
        if (!currentChatUsers || !currentChatUsers.length) {
            return '';
        } else if (currentChatUsers.length === 1) {
            return getLastSeenString(currentChatUsers[0].lastSeen);
        } else {
            const users = [authUser, ...currentChatUsers];
            const currentChatUsersNames = users.map(currentChatUser => {
                return currentChatUser.chosenDisplayName || currentChatUser.displayName || currentChatUser.email;
            }).join(', ');
            return currentChatUsersNames;
        }
    }

    return (
        <Container>
            <Left>
                {currentChatUsers && currentChatUsers.length && isThreadMode ? <ArrowBackIcon onClick={unsetThreadMode} style={{marginRight: '10px', cursor: 'pointer'}} /> : null}
                {!currentChatUsers || !currentChatUsers.length ? null : <>
                {!currentChatUsers || !currentChatUsers.length ? null : <Avatar name={currentChatUsers.length === 1 ? currentChatUsers[0].chosenDisplayName || currentChatUsers[0].displayName || currentChatUsers[0].email : 'G'} />}
                <Content onClick={handleContactInfo}>
                    <Name>{getNames()}</Name>
                    <LastSeen>{getLastSeenText()}</LastSeen>
                </Content></>}
            </Left>

            {!currentChatUsers || !currentChatUsers.length ? null : <Right>
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
