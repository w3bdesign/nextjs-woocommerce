import { ReactNode } from 'react';

export interface IAnimateProps {
  children: ReactNode;
  cssClass?: string;
}

export interface IAnimateBounceProps {
  children: ReactNode;
  cssClass?: string;
  viewAmount?: 'some' | 'all' | number;
}

export interface IAnimateWithDelayProps {
  children: ReactNode;
  cssClass?: string;
  delay: number;
}

export interface IAnimateStaggerWithDelayProps {
  children: ReactNode;
  cssClass?: string;
  delay: number;
  staggerDelay?: number;
  animateNotReverse: boolean;
}
