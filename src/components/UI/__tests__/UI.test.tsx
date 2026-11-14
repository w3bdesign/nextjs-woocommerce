import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Button from '@/components/UI/Button.component';
import Checkbox from '@/components/UI/Checkbox.component';
import RangeSlider from '@/components/UI/RangeSlider.component';

describe('Button', () => {
  it('renders a button with type "button" by default and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button handleButtonClick={onClick}>KJØP</Button>);

    const button = screen.getByRole('button', { name: 'KJØP' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports submit type, title and disabled state', async () => {
    const onClick = vi.fn();
    render(
      <Button type="submit" title="Send" buttonDisabled handleButtonClick={onClick}>
        BESTILL
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'BESTILL' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('title', 'Send');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a link when href is set', () => {
    render(<Button href="/produkter">Se produkter</Button>);
    expect(screen.getByRole('link', { name: 'Se produkter' })).toHaveAttribute(
      'href',
      '/produkter',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'bg-error'],
    ['hero', 'uppercase'],
    ['reset', 'bg-surface-alt'],
  ] as const)('applies the %s variant classes', (variant, className) => {
    render(<Button variant={variant}>Label</Button>);
    expect(screen.getByRole('button')).toHaveClass(className);
  });

  it('styles the filter variant differently when selected', () => {
    const { rerender } = render(<Button variant="filter">M</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-surface');

    rerender(
      <Button variant="filter" selected>
        M
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass('bg-primary', 'text-white');
  });

  it('adds full-width classes when fullWidth is set', () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});

describe('Checkbox', () => {
  it('renders a labelled checkbox and reports changes', async () => {
    const onChange = vi.fn();
    render(<Checkbox id="clothing" label="Clothing" checked={false} onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Clothing' });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('reflects the checked prop', () => {
    render(<Checkbox id="c" label="Checked" checked onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Checked' })).toBeChecked();
  });
});

describe('RangeSlider', () => {
  it('renders an accessible slider with raw start and current values', () => {
    render(
      <RangeSlider id="price" label="Pris" min={0} max={1000} value={500} onChange={vi.fn()} />,
    );

    const slider = screen.getByRole('slider', { name: 'Pris' });
    expect(slider).toHaveValue('500');
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('formats values and reports numeric changes', () => {
    const onChange = vi.fn();
    render(
      <RangeSlider
        id="price"
        label="Pris"
        min={0}
        max={1000}
        startValue={100}
        value={800}
        onChange={onChange}
        formatValue={(value) => `${value} kr`}
      />,
    );

    expect(screen.getByText('100 kr')).toBeInTheDocument();
    expect(screen.getByText('800 kr')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider'), { target: { value: '250' } });
    expect(onChange).toHaveBeenCalledWith(250);
  });
});
