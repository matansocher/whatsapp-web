import React from 'react';
import styled from 'styled-components';
import {CircularProgress} from '@mui/material';


function Loader({isCenteredOnParentDiv}) {
    return (
        <LoaderWrapper className={isCenteredOnParentDiv ? 'loader-centered-on-parent' : ''}>
            <CircularProgress color='inherit' />
        </LoaderWrapper>
    )
}

export default Loader;

const LoaderWrapper = styled.div`
  background-color: #151f2b;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

/* 
  background-color: #151f2b;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  /* width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); */
`;
