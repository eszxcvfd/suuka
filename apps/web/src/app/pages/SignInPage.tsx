import { AuthShell } from '../../components/layout/AuthShell';
import { SignInForm } from '../../components/auth/SignInForm';
import { AuthState } from '../../store/auth.store';

interface SignInPageProps {
  auth: AuthState;
}

export function SignInPage({ auth }: SignInPageProps) {
  return (
    <AuthShell
      title="Sign in"
      description="Return to your Suuka workspace with a clear, focused sign-in flow that keeps attention on the task."
    >
      <div className="auth-card__body">
        <header className="auth-card__header">
          <span className="eyebrow-label">Account access</span>
          <h2 className="page-title">Welcome back</h2>
          <p className="page-description">Use your email and password to continue.</p>
        </header>
        <SignInForm onSubmit={auth.signIn} />
        <div className="page-actions page-actions--split auth-page-links">
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('forgotPassword')}
          >
            Forgot password?
          </button>
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('verifyEmail')}
          >
            Verify email
          </button>
        </div>
        <footer className="auth-card__footer">
          <p className="auth-card__footer-note">Need a new Suuka account?</p>
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('signUp')}
          >
            Create one
          </button>
        </footer>
      </div>
    </AuthShell>
  );
}
