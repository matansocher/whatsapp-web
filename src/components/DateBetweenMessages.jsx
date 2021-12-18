import React from 'react';
import styled from 'styled-components';

import {Event as EventIcon} from '@mui/icons-material';

function DateBetweenMessages({ date }) {

    const formattedDate = date;
    return (
        <Container>
            <Content>
                <EventIcon />
                <p>{formattedDate}</p>
            </Content>
        </Container>
    )
}

export default DateBetweenMessages;

const Container = styled.div`
    position: relative;
    max-width: 500px;
    margin: 6px auto;
    border-radius: 7px;
`;

const Content = styled.div`
    background-color: #1e2a30;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 12px 6px;
    box-shadow: 0 1px 0.5px rgba(0,0,0,.13);
    font-size: 12.5px;
    line-height: 21px;
    color: rgba(241,241,242,0.92);

    p {
        margin-left: 5px;
        font-weight: 500;
    }
    svg {
        width: 20px;
    }
`;
