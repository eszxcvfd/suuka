import { FormEvent, useId, useState } from 'react';
import { AuthShell } from '../../components/layout/AuthShell';
import { AuthState } from '../../store/auth.store';

interface VerifyEmailPageProps {
  auth: AuthState;
}

export function VerifyEmailPage({ auth }: VerifyEmailPageProps) {
  const verifyFieldId = useId();
  const resendFieldId = useId();
  const feedbackId = useId();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isVerifying) {
      return;
    }
    setError(null);
    setMessage(null);
    setIsVerifying(true);
    try {
      await auth.verifyEmail(token);
      setMessage('Email verified successfully.');
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Unable to verify email');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isResending) {
      return;
    }
    setError(null);
    setMessage(null);
    setIsResending(true);
    try {
      await auth.resendVerification(email);
      setMessage('Verification instructions sent if account exists.');
    } catch (resendError) {
      setError(
        resendError instanceof Error ? resendError.message : 'Unable to resend verification',
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      title="Verify email"
      description="Confirm your email address or request a new verification message from one calm, clearly structured workspace."
    >
      <div className="auth-card__body">
        <header className="auth-card__header">
          <span className="eyebrow-label">Email confirmation</span>
          <h2 className="page-title">Finish account verification</h2>
          <p className="page-description">
            Enter your verification token below, or request another email if you still need one.
          </p>
        </header>

        <section className="auth-card__section">
          <div className="section-header__content">
            <h3 className="section-header__title">Verification token</h3>
            <p className="section-header__text">
              Use the token from your email to confirm your account access.
            </p>
          </div>
          <form className="form-grid" onSubmit={handleVerify} aria-busy={isVerifying}>
            <div className="field">
              <label className="field-label" htmlFor={verifyFieldId}>
                Verification token
              </label>
              <input
                id={verifyFieldId}
                aria-describedby={error || message ? feedbackId : undefined}
                className="field-input"
                type="text"
                disabled={isVerifying}
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </div>
            <div className="form-actions page-actions--start">
              <button className="button button--primary" type="submit" disabled={isVerifying}>
                {isVerifying ? 'Verifying email…' : 'Verify email'}
              </button>
            </div>
          </form>
        </section>

        <section className="auth-card__section">
          <div className="section-header__content">
            <h3 className="section-header__title">Need another email?</h3>
            <p className="section-header__text">
              Request a fresh verification message for the account you want to confirm.
            </p>
          </div>
          <form className="form-grid" onSubmit={handleResend} aria-busy={isResending}>
            <div className="field">
              <label className="field-label" htmlFor={resendFieldId}>
                Email address
              </label>
              <input
                id={resendFieldId}
                aria-describedby={error || message ? feedbackId : undefined}
                className="field-input"
                type="email"
                disabled={isResending}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="form-actions page-actions--start">
              <button className="button button--tonal" type="submit" disabled={isResending}>
                {isResending ? 'Sending verification…' : 'Resend verification'}
              </button>
            </div>
          </form>
        </section>

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
        <div className="page-actions page-actions--split auth-page-links">
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('signUp')}
          >
            Need an account first?
          </button>
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('resetPassword')}
          >
            Need password help too?
          </button>
        </div>
        <footer className="auth-card__footer">
          <p className="auth-card__footer-note">Already verified or ready to continue?</p>
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('signIn')}
          >
            Back to sign in
          </button>
        </footer>
      </div>
    </AuthShell>
  );
}
