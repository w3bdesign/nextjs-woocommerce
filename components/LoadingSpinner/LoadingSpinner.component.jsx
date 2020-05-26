import React from 'react';
import styled, { keyframes } from 'styled-components';

const LoadingSpinner = () => {
  return (
    <Container>
      <Circle />
    </Container>
  );
};

export default LoadingSpinner;

const breatheAnimation = keyframes`
 0% { transform: rotate(0deg); opacity: 1 } 
 /*20% { transform: rotate(72deg); opacity: 0.5 } 
 40% { transform: rotate(144deg); opacity: 1 } 
 60% { transform: rotate(216deg); opacity: 0.5 } 
 80% { transform: rotate(288deg); opacity: 0.5 } */ 
 100% { transform: rotate(360deg); opacity: 1; }
`;

const Circle = styled.div`
width: 100px;
  height: 100px;
  border-radius: 50px;
  border: 10px solid black;
  border-right: 10px solid white;
  border-bottom: 10px solid white;
  animation-name: ${breatheAnimation};
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
-webkit-animation-timing-function: ease-in-out;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 130px;
`;
