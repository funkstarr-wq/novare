import { RichText } from '@/components/RichText'
import { Section } from '@/components/Section'
import { populated } from '@/lib/format'
import { getBySlug } from '@/lib/queries'
import { pathFor } from '@/lib/urls'
import type { ContactFormBlock } from '@/payload-types'

import { type FormField, FormClient } from './FormClient'
import type { SectionProps } from './types'

/** A form-builder form (brief §9). Spam protection and consent logging arrive in M7. */
export async function ContactForm({ block, draft }: SectionProps<ContactFormBlock>) {
  const form = populated(block.form)
  if (!form) return null
  const privacy = await getBySlug(draft, 'legal-documents', 'privacy-notice')
  const fields: FormField[] = (form.fields ?? []).map((field) =>
    field.blockType === 'message'
      ? { blockType: 'message', id: field.id ?? '', content: <RichText data={field.message} /> }
      : { ...field, id: field.id ?? field.name },
  )
  return (
    <Section heading={block.heading} id="contact-form">
      {block.intro && <p className="max-w-(--container-prose) text-ink-muted">{block.intro}</p>}
      <FormClient
        formId={form.id}
        fields={fields}
        submitLabel={form.submitButtonLabel || 'Send'}
        confirmation={<RichText data={form.confirmationMessage} />}
        redirectTo={form.confirmationType === 'redirect' ? form.redirect?.url : undefined}
        privacyHref={privacy ? pathFor('legal-documents', privacy) : null}
      />
    </Section>
  )
}
