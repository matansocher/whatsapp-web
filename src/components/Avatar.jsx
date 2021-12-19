import React from 'react';
import MUIAvatar from '@material-ui/core/Avatar';
import styled from 'styled-components';
import {Group as GroupIcon} from '@mui/icons-material';

function Avatar({ photo = '', name = '', onclick, size }) {
    const letters = name.charAt(0).toUpperCase() || 'AA';

    const getStyleObj = () => {
        let style = {};
        if (size) {
            style = { ...getSizeAttributes(size) }
        }
        if (onclick) {
            style['cursor'] = 'pointer';
        }
        return style;
    }

    const getSizeAttributes = (size) => {
        switch (size) {
            case 'small':
                return { width: '26px', height: '26px', fontSize: '14px' };
            case 'medium':
                return { width: '40px', height: '40px', fontSize: '20px' };
            case 'big':
                return { width: '100px', height: '100px', fontSize: '50px' };
            default:
                return getSizeAttributes('medium');
        }
    }

    return (
        <Container onClick={onclick}>
            {/* {photo ? <Image src={photo} alt={`user`} /> : <MUIAvatar>{ letters }</MUIAvatar>} */}
            <MUIAvatar style={getStyleObj()}>{ letters === 'G' ? <GroupIcon /> : letters }</MUIAvatar>
        </Container>
    )
}

export default Avatar;

const Container = styled.div`
    
`;

// const Image = styled.img`
//     width: 40px;
//     font-size: 15px;
//     font-weight: 900;
//     border-radius: 50%;
// `;
