import { AuthShell } from '../../components/layout/AuthShell';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { AuthState } from '../../store/auth.store';

interface ResetPasswordPageProps {
  auth: AuthState;
}

export function ResetPasswordPage({ auth }: ResetPasswordPageProps) {
  return (
    <AuthShell
      title="Reset password"
      description="Complete your recovery with a focused reset flow that highlights the token and your new password clearly."
    >
      <div className="auth-card__body">
        <header className="auth-card__header">
          <span className="eyebrow-label">Password update</span>
          <h2 className="page-title">Choose a new password</h2>
          <p className="page-description">
            Paste the reset token from your email and enter the password you want to use next.
          </p>
        </header>
        <ResetPasswordForm onSubmit={auth.confirmPasswordReset} />
        <div className="page-actions page-actions--split auth-page-links">
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('forgotPassword')}
          >
            Need a new reset link?
          </button>
        </div>
        <footer className="auth-card__footer">
          <p className="auth-card__footer-note">Need to request a fresh reset link?</p>
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
