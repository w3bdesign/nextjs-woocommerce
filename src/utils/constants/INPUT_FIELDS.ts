export const INPUT_FIELDS = [
  {
    id: 0,
    label: 'Fornavn',
    name: 'firstName',
    customValidation: { required: true, minlength: 4 },
  },
  {
    id: 1,
    label: 'Etternavn',
    name: 'lastName',
    customValidation: { required: true, minlength: 4 },
  },
  {
    id: 2,
    label: 'Adresse',
    name: 'address1',
    customValidation: { required: true, minlength: 4 },
  },
  {
    id: 3,
    label: 'Postnummer',
    name: 'postcode',
    customValidation: { required: true, minlength: 4, pattern: '[+0-9]{4,6}' },
  },
  {
    id: 4,
    label: 'Sted',
    name: 'city',
    customValidation: { required: true, minlength: 2 },
  },
  {
    id: 5,
    label: 'Epost',
    name: 'email',
    customValidation: { required: true, type: 'email' },
  },
  {
    id: 6,
    label: 'Telefon',
    name: 'phone',
    customValidation: { required: true, minlength: 8, pattern: '[+0-9]{8,12}' },
  },
];
