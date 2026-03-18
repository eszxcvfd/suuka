import { FormEvent, useId, useState } from 'react';

interface ResetPasswordFormProps {
  onSubmit: (token: string, newPassword: string) => Promise<void>;
}

export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const tokenId = useId();
  const passwordId = useId();
  const feedbackId = useId();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      await onSubmit(token, newPassword);
      setMessage('Password reset completed.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to reset password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className="field">
        <label className="field-label" htmlFor={tokenId}>
          Reset token
        </label>
        <input
          id={tokenId}
          aria-describedby={error || message ? feedbackId : undefined}
          className="field-input"
          type="text"
          disabled={isSubmitting}
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor={passwordId}>
          New password
        </label>
        <input
          id={passwordId}
          aria-describedby={error || message ? feedbackId : undefined}
          className="field-input"
          type="password"
          autoComplete="new-password"
          disabled={isSubmitting}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>
      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Resetting password…' : 'Reset password'}
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
