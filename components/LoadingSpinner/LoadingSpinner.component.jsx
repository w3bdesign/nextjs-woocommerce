import React from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * Loading spinner, shows while loading products or categories. 
 * Uses Styled-Components
 */
const LoadingSpinner = () => {
  return (
    <>
      <Container>
        <Circle />
      </Container>
    </>
  );
};

export default LoadingSpinner;

const rotateAnimation = keyframes`
 0% { transform: rotate(0deg);  } 
 50% { transform: rotate(180deg);  }
 100% { transform: rotate(360deg);  }
`;

const Circle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  border: 10px solid black;
  border-right: 10px solid white;
  border-bottom: 10px solid white;
  animation-name: ${rotateAnimation};
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  -webkit-animation-timing-function: linear;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 110px;
`;
