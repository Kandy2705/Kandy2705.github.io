import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { sendContact } from '@/services/contactService'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<string>('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    setStatus('')
    try {
      const result = await sendContact(values)
      setStatus(result.emailed ? 'Message sent successfully.' : t('contact.success'))
      reset()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send message.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="admin-label">{t('contact.name')}<input {...register('name')} className="admin-input" />{errors.name && <span className="text-xs text-pink-300">Please enter your name.</span>}</label>
        <label className="admin-label">{t('contact.email')}<input {...register('email')} className="admin-input" />{errors.email && <span className="text-xs text-pink-300">Please enter a valid email.</span>}</label>
      </div>
      <label className="admin-label">{t('contact.subject')}<input {...register('subject')} className="admin-input" /></label>
      <label className="admin-label">{t('contact.message')}<textarea {...register('message')} rows={6} className="admin-input resize-y" /></label>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={isSubmitting} className="neon-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          <Send size={16} /> {isSubmitting ? t('contact.sending') : t('contact.send')}
        </button>
        {status && <span className="max-w-xl text-xs leading-5 text-white/55">{status}</span>}
      </div>
    </form>
  )
}
