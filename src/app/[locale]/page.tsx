'use client';
import { useTranslations, useLocale } from 'next-intl';
import Header from '../components/Header';
import OrangeLine from '../components/OrangeLine';
import { FormEvent, ChangeEvent, useState, useEffect } from 'react';
import PillButton from '../components/PillButton';
import { contactSchema, type Contact } from '@/src/lib/schemas/contact';
import ChatKitView from '../components/ChatKitView';

export default function Home() {
  const t = useTranslations('ContactForm');
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [pdfExpiresAt, setPdfExpiresAt] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  type ContactFormFields = Omit<Contact, 'locale'>;

  const [customerFormData, setCustomerFormData] = useState<ContactFormFields>({
    name: '',
    company: '',
    email: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    company: '',
  });

  useEffect(() => {
    fetch('/api/session/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    })
      .then((r) => r.json())
      .then(({ token }) => setSessionToken(token))
      .catch((err) => console.error('anon session failed', err));
  }, [locale]);

  useEffect(() => {
    if (!sessionToken) return;
    const interval = setInterval(async () => {
      const res = await fetch('/api/session', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.pdfExpiresAt) setPdfExpiresAt(data.pdfExpiresAt);
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      }
      if (data.pdfStatus) {
        setPdfStatus(data.pdfStatus);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setCustomerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const result = contactSchema.safeParse({ ...customerFormData, locale });

    if (result.success) {
      setErrors({ name: '', email: '', company: '' });
      return true;
    }

    const newErrors = { name: '', email: '', company: '' };
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof typeof newErrors;
      if (field && !newErrors[field]) newErrors[field] = issue.message;
    }
    setErrors(newErrors);
    return false;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      alert(t('submitError'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/session', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ ...customerFormData, locale }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error submitting form:', message);
      alert(t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!pdfUrl || !customerFormData.email) return;
    setIsSendingEmail(true);
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customerFormData,
          locale,
          pdfUrl,
          pdfExpiresAt,
        }),
      });
      setEmailSent(true);
    } catch (err) {
      console.error('Email send failed', err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <Header />
      <h1 className="text-header text-primary text-center font-bold">
        {t('heading')}
      </h1>

      <OrangeLine />

      <div className="flex flex-col items-center gap-6">
        {sessionToken ? (
          <ChatKitView
            sessionToken={sessionToken}
            locale={locale as 'sv' | 'en'}
          />
        ) : (
          <div className="text-sm text-gray-500">{t('chatLoading')}</div>
        )}
        {!pdfUrl && pdfStatus === 'generating' && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="border-primary inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            {locale === 'sv' ? 'Genererar din PDF…' : 'Generating your PDF…'}
          </div>
        )}
        {pdfUrl && (
          <div className="flex gap-3">
            <PillButton
              href={pdfUrl}
              text={locale === 'sv' ? 'Ladda ner' : 'Download'}
              variant="blue"
            />
            {customerFormData.email &&
              customerFormData.name &&
              customerFormData.company &&
              (emailSent ? (
                <span className="self-center text-xs text-gray-500">
                  {locale === 'sv'
                    ? 'Skickad! En kopia har även skickats till oss'
                    : 'Sent! A copy has also been sent to us.'}
                </span>
              ) : (
                <PillButton
                  text={locale === 'sv' ? 'Skicka via e-post' : 'Email me this'}
                  variant="orange"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                />
              ))}
          </div>
        )}
        <form
          className="flex w-full max-w-md flex-col px-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col py-3">
            <div className="flex items-center gap-2">
              <label htmlFor="name" className="py-1 text-sm">
                {t('name.label')}
              </label>
              {errors.name && <p className="text-red-500">{t(errors.name)}</p>}
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={customerFormData.name}
              onChange={handleChange}
              placeholder={t('name.placeholder')}
              className="bg-inputbg border-lightgrey my-1 rounded-lg border-1 border-solid p-2 text-xs"
              minLength={2}
              maxLength={100}
              required
            />
          </div>
          <div className="flex flex-col py-3">
            <label htmlFor="company" className="py-1 text-sm">
              {t('company.label')}
            </label>
            {errors.company && (
              <p className="text-red-500">{t(errors.company)}</p>
            )}
            <input
              id="company"
              name="company"
              type="text"
              value={customerFormData.company}
              onChange={handleChange}
              placeholder={t('company.placeholder')}
              className="bg-inputbg border-lightgrey my-1 rounded-lg border-1 border-solid p-2 text-xs"
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className="flex flex-col py-3">
            <div className="flex items-center gap-2">
              <label htmlFor="email" className="py-1 text-sm">
                {t('email.label')}
              </label>
              {errors.email && (
                <p className="text-sm text-red-500">{t(errors.email)}</p>
              )}
            </div>
            <input
              id="email"
              value={customerFormData.email}
              name="email"
              type="email"
              onChange={handleChange}
              placeholder={t('email.placeholder')}
              className="bg-inputbg border-lightgrey my-1 rounded-lg border-1 border-solid p-2 text-xs"
              maxLength={100}
              required
            />
          </div>
        </form>
      </div>
    </>
  );
}
