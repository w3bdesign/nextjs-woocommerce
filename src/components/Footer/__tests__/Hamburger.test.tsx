import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Hamburger from '@/components/Footer/Hamburger.component';
import LINKS from '@/utils/constants/LINKS';

const toggle = () => screen.getByTestId('hamburger');
const menu = (container: HTMLElement) =>
  container.querySelector('#mobile-menu') as HTMLElement;
const finishAnimation = () => act(() => vi.advanceTimersByTime(1000));

describe('Hamburger', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts collapsed with a hidden menu', () => {
    const { container } = render(<Hamburger />);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toBeEnabled();
    expect(menu(container)).toHaveAttribute('aria-hidden', 'true');
    expect(menu(container)).toHaveClass('invisible');
  });

  it('renders a link for every navigation entry', () => {
    render(<Hamburger />);
    for (const { title, href } of LINKS) {
      expect(screen.getByRole('button', { name: title, hidden: true }).closest('a')).toHaveAttribute(
        'href',
        href,
      );
    }
  });

  it('opens the menu and locks the toggle until the animation ends', () => {
    const { container } = render(<Hamburger />);

    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(toggle()).toBeDisabled();
    expect(menu(container)).toHaveAttribute('aria-hidden', 'false');
    expect(menu(container)).not.toHaveClass('invisible');

    finishAnimation();
    expect(toggle()).toBeEnabled();
  });

  it('hides the menu again only after the closing animation', () => {
    const { container } = render(<Hamburger />);
    fireEvent.click(toggle());
    finishAnimation();

    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(menu(container)).not.toHaveClass('invisible');

    finishAnimation();
    expect(menu(container)).toHaveClass('invisible');
    expect(toggle()).toBeEnabled();
  });

  it('closes the menu when a link is chosen', () => {
    render(<Hamburger />);
    fireEvent.click(toggle());
    finishAnimation();

    fireEvent.click(screen.getByRole('button', { name: 'Produkter' }));
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores link clicks while the menu is animating', () => {
    render(<Hamburger />);
    fireEvent.click(toggle());

    fireEvent.click(screen.getByRole('button', { name: 'Produkter' }));
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
  });
});
