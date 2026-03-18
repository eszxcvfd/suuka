import { FormEvent, useId, useState } from 'react';

interface SignUpFormProps {
  onSubmit: (displayName: string, email: string, password: string) => Promise<void>;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const displayNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(displayName, email, password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign up');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className="field">
        <label className="field-label" htmlFor={displayNameId}>
          Display name
        </label>
        <input
          id={displayNameId}
          aria-describedby={error ? errorId : undefined}
          className="field-input"
          type="text"
          autoComplete="name"
          disabled={isSubmitting}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor={emailId}>
          Email address
        </label>
        <input
          id={emailId}
          aria-describedby={error ? errorId : undefined}
          className="field-input"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor={passwordId}>
          Password
        </label>
        <input
          id={passwordId}
          aria-describedby={error ? errorId : undefined}
          className="field-input"
          type="password"
          autoComplete="new-password"
          disabled={isSubmitting}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
      {error ? (
        <p id={errorId} className="message message--error" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
