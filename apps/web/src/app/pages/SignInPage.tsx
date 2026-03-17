import { SignInForm } from '../../components/auth/SignInForm';
import { AuthState } from '../../store/auth.store';

interface SignInPageProps {
  auth: AuthState;
}

export function SignInPage({ auth }: SignInPageProps) {
  return (
    <section className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <SignInForm onSubmit={auth.signIn} />
    </section>
  );
}
