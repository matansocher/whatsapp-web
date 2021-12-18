import React, { useState } from 'react';
import styled from 'styled-components';

import firebaseService from '../services/firebase/service';
import { auth } from '../services/firebase/config';
import { useSelector } from 'react-redux';

import { Avatar } from '.';

import {Menu, MenuItem, ListItemText, ListItemIcon} from '@mui/material';
import {Logout as LogoutIcon, MoreVert as MoreVertIcon, Person as PersonIcon, Group as GroupIcon, Star as StarIcon, Settings as SettingsIcon} from '@mui/icons-material';

function HeaderInfo({ setIsEditProfileScreen }) {
    const authUser = useSelector(state => state.authUserDetails.value);

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const logOut = (e) => {
        auth.signOut();
        setAnchorEl(null);
    }

    const getStarredMessages = async (e) => {
        const starredMessages = await firebaseService.getStarredMessages(authUser.uid);
        console.log(starredMessages);
        setAnchorEl(null);
    }

    const handleEditProfileClick = async (e) => {
        setIsEditProfileScreen(true);
        setAnchorEl(null);
    }

    const hadnleSettingsClicked = async (e) => {
        setAnchorEl(null);
    }

    return (
        <Container>
            <ContainerHeader>
                <Info>
                    <Avatar photo={authUser.photoURL} name={authUser.chosenDisplayName || authUser.displayName || authUser.email} />
                    <p>{authUser.chosenDisplayName || authUser.displayName || authUser.email}</p>
                </Info>

                <Options>
                    <MoreVertIcon onClick={(e) => setAnchorEl(e.currentTarget)} />

                    <Menu
                        anchorEl={anchorEl}
                        open={isMenuOpen}
                        onClose={() => setAnchorEl(null)}
                        MenuListProps={{ 'aria-labelledby': 'basic-button' }}>
                        <MenuItem onClick={handleEditProfileClick}>
                            <ListItemIcon>
                                <PersonIcon fontSize='small' />
                            </ListItemIcon>
                            <ListItemText>Edit Profile</ListItemText>
                        </MenuItem>
                        <MenuItem>
                            <ListItemIcon>
                                <GroupIcon fontSize='small' />
                            </ListItemIcon>
                            <ListItemText>New Group</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={getStarredMessages}>
                            <ListItemIcon>
                                <StarIcon fontSize='small' />
                            </ListItemIcon>
                            <ListItemText>Starred Messages</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={hadnleSettingsClicked}>
                            <ListItemIcon>
                                <SettingsIcon fontSize='small' />
                            </ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={logOut}>
                            <ListItemIcon>
                                <LogoutIcon fontSize='small' />
                            </ListItemIcon>
                            <ListItemText>Sign Out</ListItemText>
                        </MenuItem>
                    </Menu>
                </Options>

            </ContainerHeader>

        </Container>
    )
}

export default HeaderInfo;

const Container = styled.div`
    background-color: #15202b;
    height: 60px;
    border-bottom: 1px solid #323739;
`;

const ContainerHeader = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    padding: 10px 15px;
    > .MuiSvgIcon-root {
        padding: 8px;
        color: #ffffff;
        font-size: 18px;
        background-color: #ffffff;
        border-radius: 50px;
    }
`;

const Info = styled.div`
    flex: 1;
    display: flex;
    align-items: center;

    > p {
        font-size: 15px;
        font-weight: 900;
        margin-bottom: 5px;
        margin-left: 10px;
    }

`;

const Options = styled.div`
    display: flex;
    align-items: center;
    > .MuiSvgIcon-root {
        margin-left: 10px;
        cursor: pointer;
    }
`;