import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { InputField } from '@/components/Input/InputField.component';

/** Renders one field inside a form, with a button that sets an error without a message. */
const Harness = ({ type }: { type?: string }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <InputField
        inputLabel="Fornavn"
        inputName="firstName"
        customValidation={{}}
        type={type}
      />
      <button
        type="button"
        onClick={() => methods.setError('firstName', { type: 'manual' })}
      >
        Fail
      </button>
    </FormProvider>
  );
};

describe('InputField', () => {
  it('defaults to a text input without a required marker', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Fornavn');

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('uses the given input type', () => {
    render(<Harness type="email" />);
    expect(screen.getByLabelText('Fornavn')).toHaveAttribute('type', 'email');
  });

  it('falls back to a "required" message for errors without a message', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Fail' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Fornavn er påkrevd');
    expect(screen.getByLabelText('Fornavn')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Fornavn')).toHaveAttribute(
      'aria-describedby',
      'firstName-error',
    );
  });
});
