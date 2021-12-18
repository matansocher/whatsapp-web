import React, { useRef } from 'react';
import styled from 'styled-components';
import firebase from 'firebase';
import { get } from 'lodash';
import { auth } from '../services/firebase/config';

function Login() {

    const emailInput = useRef(null);
    const passwordInput = useRef(null);

    const signInWithGoogle = async (e) => {
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(googleProvider);
    }

    const signInWithEmailAndPassword = async (e) => {
        const email = get(emailInput, 'current.value', '');
        const password = get(passwordInput, 'current.value', '');
        if (!email || !password) {
            return;
        }
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (err) {
            if (err.code !== 'auth/user-not-found') {
                console.error(err); // real error - not user not existing error
            }
            // user does not exist, signup and then signin
            await auth.createUserWithEmailAndPassword(email, password);
            signInWithEmailAndPassword(e);
        }
    }

    return (
        <Container>
            <Card>
                <Header>Login</Header>
                
                <Input type='text' name='email' placesholder='email' ref={emailInput} />
                <Input type='password' name='password' placesholder='password' ref={passwordInput} />
                <Button onClick={signInWithEmailAndPassword}>Login</Button>

                <Or>Or login with</Or>

                <GoogleButton onClick={signInWithGoogle}>Google</GoogleButton>
            </Card>
        </Container>
    )
}

export default Login;


const Container = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #3394e1;
`;

const Card = styled.div`
    max-width: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 484px;
    background-color: #2c333d;
    border-radius: 32px;
    position: relative;
    text-align: center;
    margin: auto;
    min-height: 450px;
    box-shadow: rgb(0 0 0 / 45%) 0px 2px 10px;
    min-height: 400px;
    padding: 20px 10px 24px;
    box-sizing: border-box;
`;

const Header = styled.h1`

`;

const Or = styled.p`
    margin-top: 40px;
    font-size: 16px;
    font-weight: 500;
`;

const Button = styled.button`
    color: #fff;
    background-color: #3394e1;
    width: 80%;
    border-radius: 12px;
    margin-top: 15px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0;
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    font-weight: 600;
    padding: 0px 10px;
`;

const GoogleButton = styled.button`
    color: #404040;
    background-color: #ffffff;
    width: 80%;
    border-radius: 12px;
    margin-top: 15px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 0;
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    border: 1px solid #dbdee3;
    font-weight: 600;
    padding: 0px 10px;
`;

const Input = styled.input`
    font-size: 12px;
    color: #000;
    font-weight: 400;
    width: 80%;
    height: 40px;
    border-radius: 12px;
    border: 1px solid #c9cfd3;
    margin-top: 12px;
    padding: 0px 10px;
`;
