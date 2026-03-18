import { AuthShell } from '../../components/layout/AuthShell';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { AuthState } from '../../store/auth.store';

interface ForgotPasswordPageProps {
  auth: AuthState;
}

export function ForgotPasswordPage({ auth }: ForgotPasswordPageProps) {
  return (
    <AuthShell
      title="Forgot password"
      description="Request a fresh reset link with a simple recovery flow that keeps guidance and feedback in one place."
    >
      <div className="auth-card__body">
        <header className="auth-card__header">
          <span className="eyebrow-label">Recovery</span>
          <h2 className="page-title">Reset your password</h2>
          <p className="page-description">
            Enter the email address tied to your account and we’ll send reset instructions.
          </p>
        </header>
        <ForgotPasswordForm onSubmit={auth.requestPasswordReset} />
        <div className="page-actions page-actions--split auth-page-links">
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('resetPassword')}
          >
            Already have a reset token?
          </button>
        </div>
        <footer className="auth-card__footer">
          <p className="auth-card__footer-note">Remembered your password?</p>
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
