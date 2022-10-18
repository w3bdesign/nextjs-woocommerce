import { getCustomNumberValidation } from '../functions/functions';

export const INPUT_FIELDS = [
  { label: 'Fornavn', name: 'firstName' },
  { label: 'Etternavn', name: 'lastName' },
  { label: 'Adresse', name: 'address1' },
  {
    label: 'Postnummer',
    name: 'postcode',
    customValidation: getCustomNumberValidation(
      {
        minLength: 'Postnummer må være minimum 4 tall',
        maxLength: 'Postnummer må være maksimalt 4 tall',
        pattern: 'Postnummer må bare være tall',
      },
      4
    ),
  },
  { label: 'Sted', name: 'city' },
  {
    label: 'Epost',
    name: 'email',
    customValidation: getCustomNumberValidation(
      { pattern: 'Du må oppgi en gyldig epost' },
      undefined,
      /^[a-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[a-z0-9.-]+$/gim
    ),
  },
  {
    label: 'Telefon',
    name: 'phone',
    customValidation: getCustomNumberValidation(
      {
        minLength: 'Minimum 8 tall i telefonnummeret',
        maxLength: 'Maksimalt 8 tall i telefonnummeret',
        pattern: 'Ikke gyldig telefonnummer',
      },
      8
    ),
  },
];
