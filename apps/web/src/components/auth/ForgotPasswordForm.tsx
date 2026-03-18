import { FormEvent, useId, useState } from 'react';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const emailId = useId();
  const feedbackId = useId();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit(email);
      setMessage('If the account exists, reset instructions were sent.');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to request password reset',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className="field">
        <label className="field-label" htmlFor={emailId}>
          Email address
        </label>
        <input
          id={emailId}
          aria-describedby={error || message ? feedbackId : undefined}
          className="field-input"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
      </button>
      {message ? (
        <p id={feedbackId} className="message message--success" aria-live="polite">
          {message}
        </p>
      ) : null}
      {error ? (
        <p id={feedbackId} className="message message--error" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
