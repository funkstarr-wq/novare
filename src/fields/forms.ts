import type { Field } from 'payload'

/** Who gets each enquiry, by the value of its "topic" field (brief §9). */
export const formRoutingField: Field = {
  name: 'routing',
  label: 'Enquiry routing',
  type: 'array',
  admin: {
    description:
      'Who receives each enquiry, by topic: use the value of an option in the "topic" field, or * for any topic without its own entry. The sender’s confirmation email is set under Emails.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'topic', type: 'text', required: true, admin: { width: '40%' } },
        {
          name: 'emailTo',
          label: 'Send to',
          type: 'email',
          required: true,
          admin: { width: '60%' },
        },
      ],
    },
  ],
}

/** The POPIA consent the sender gave, as they saw it, kept with the submission. */
export const consentRecordField: Field = {
  name: 'consent',
  label: 'Consent record',
  type: 'group',
  admin: { readOnly: true, position: 'sidebar' },
  fields: [
    { name: 'given', type: 'checkbox' },
    { name: 'text', label: 'Wording shown', type: 'textarea' },
    {
      name: 'at',
      label: 'Given at',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
