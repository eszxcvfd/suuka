import { AuthShell } from '../../components/layout/AuthShell';
import { SignUpForm } from '../../components/auth/SignUpForm';
import { AuthState } from '../../store/auth.store';

interface SignUpPageProps {
  auth: AuthState;
}

export function SignUpPage({ auth }: SignUpPageProps) {
  return (
    <AuthShell
      title="Create account"
      description="Set up a new workspace with lightweight account details and strong, readable form feedback across every step."
    >
      <div className="auth-card__body">
        <header className="auth-card__header">
          <span className="eyebrow-label">Get started</span>
          <h2 className="page-title">Open your workspace</h2>
          <p className="page-description">
            Add a display name, email, and password to create your account.
          </p>
        </header>
        <SignUpForm onSubmit={auth.signUp} />
        <div className="page-actions page-actions--split auth-page-links">
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('verifyEmail')}
          >
            Have a verification token?
          </button>
        </div>
        <footer className="auth-card__footer">
          <p className="auth-card__footer-note">Already have an account?</p>
          <button
            className="button button--text"
            type="button"
            onClick={() => auth.setMode('signIn')}
          >
            Sign in
          </button>
        </footer>
      </div>
    </AuthShell>
  );
}
