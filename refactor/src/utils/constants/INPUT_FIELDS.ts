import { getCustomNumberValidation } from '@/utils/functions/functions';

export const INPUT_FIELDS = [
  { id: 0, label: 'Fornavn', name: 'firstName' },
  { id: 1, label: 'Etternavn', name: 'lastName' },
  { id: 2, label: 'Adresse', name: 'address1' },
  {
    id: 3,
    label: 'Postnummer',
    name: 'postcode',
    customValidation: getCustomNumberValidation({
      minLength: 'Postnummer må være minimum 4 tall',
      maxLength: 'Postnummer må være maksimalt 4 tall',
      pattern: 'Postnummer må bare være tall',
    }),
  },
  { id: 4, label: 'Sted', name: 'city' },
  {
    id: 5,
    label: 'Epost',
    name: 'email',
    customValidation: getCustomNumberValidation({
      pattern: 'Du må oppgi en gyldig epost',
      patternValue: /^[a-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[a-z0-9.-]+$/gim,
    }),
  },
  {
    id: 6,
    label: 'Telefon',
    name: 'phone',
    customValidation: getCustomNumberValidation({
      minLength: 'Minimum 8 tall i telefonnummeret',
      maxLength: 'Maksimalt 8 tall i telefonnummeret',
      pattern: 'Ikke gyldig telefonnummer',
    }),
  },
];
