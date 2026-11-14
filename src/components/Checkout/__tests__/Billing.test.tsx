import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Billing from '@/components/Checkout/Billing.component';
import { INPUT_FIELDS } from '@/utils/constants/INPUT_FIELDS';

const VALID = {
  Fornavn: 'Kari',
  Etternavn: 'Nordmann',
  Adresse: 'Karl Johans gate 1',
  Postnummer: '0154',
  Sted: 'Oslo',
  Epost: 'kari@example.com',
  Telefon: '12345678',
};

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`));

const renderBilling = () => {
  const handleFormSubmit = vi.fn();
  render(<Billing handleFormSubmit={handleFormSubmit} />);
  return { handleFormSubmit, user: userEvent.setup() };
};

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<typeof VALID> = {},
) => {
  for (const [label, value] of Object.entries({ ...VALID, ...overrides })) {
    if (value) await user.type(field(label), value);
  }
};

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'BESTILL' }));

describe('Billing', () => {
  it('renders a labelled input for every checkout field', () => {
    renderBilling();
    for (const { label, type } of INPUT_FIELDS) {
      expect(field(label)).toHaveAttribute('type', type);
    }
    expect(screen.getByRole('button', { name: 'BESTILL' })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('marks required fields and passes validation attributes to the inputs', () => {
    renderBilling();
    const postcode = field('Postnummer');
    expect(postcode).toBeRequired();
    expect(postcode).toHaveAttribute('minLength', '4');
    expect(postcode).toHaveAttribute('pattern', '[+0-9]{4,6}');
    expect(postcode).toHaveAttribute('autoComplete', 'postal-code');
  });

  it('submits the entered data together with the cod payment method', async () => {
    const { handleFormSubmit, user } = renderBilling();

    await fillForm(user);
    await submit(user);

    await waitFor(() => expect(handleFormSubmit).toHaveBeenCalledOnce());
    expect(handleFormSubmit.mock.calls[0][0]).toEqual({
      firstName: 'Kari',
      lastName: 'Nordmann',
      address1: 'Karl Johans gate 1',
      postcode: '0154',
      city: 'Oslo',
      email: 'kari@example.com',
      phone: '12345678',
      paymentMethod: 'cod',
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks submission and flags every empty required field', async () => {
    const { handleFormSubmit, user } = renderBilling();

    await submit(user);

    expect(await screen.findByText('Fornavn er påkrevd')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(INPUT_FIELDS.length);
    for (const { label, name } of INPUT_FIELDS) {
      expect(field(label)).toHaveAttribute('aria-invalid', 'true');
      expect(field(label)).toHaveAttribute('aria-describedby', `${name}-error`);
    }
    expect(handleFormSubmit).not.toHaveBeenCalled();
  });

  it('enforces the minimum length', async () => {
    const { handleFormSubmit, user } = renderBilling();

    await fillForm(user, { Adresse: 'Gt1' });
    await submit(user);

    expect(await screen.findByText('Adresse må være minst 4 tegn')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(handleFormSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['Postnummer', 'abcd'],
    ['Postnummer', '1234567'],
    ['Telefon', '1234-5678'],
  ])('rejects an invalid %s value %j', async (label, value) => {
    const { handleFormSubmit, user } = renderBilling();

    await fillForm(user, { [label]: value });
    await submit(user);

    expect(await screen.findByText(`${label} har ugyldig format`)).toBeInTheDocument();
    expect(handleFormSubmit).not.toHaveBeenCalled();
  });

  it('clears the error and submits once the field is corrected', async () => {
    const { handleFormSubmit, user } = renderBilling();

    await fillForm(user, { Fornavn: '' });
    await submit(user);
    expect(await screen.findByText('Fornavn er påkrevd')).toBeInTheDocument();

    await user.type(field('Fornavn'), 'Kari');
    await submit(user);

    await waitFor(() => expect(handleFormSubmit).toHaveBeenCalledOnce());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
