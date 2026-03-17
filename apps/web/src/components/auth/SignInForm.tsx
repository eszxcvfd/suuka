import { FormEvent, useState } from 'react';

interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function SignInForm({ onSubmit }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit(email, password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in');
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <input
        className="rounded border border-slate-300 p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="rounded border border-slate-300 p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">
        Sign in
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
