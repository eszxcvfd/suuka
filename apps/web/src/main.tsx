import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MediaPage } from './app/pages/MediaPage';
import { ForgotPasswordPage } from './app/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './app/pages/ResetPasswordPage';
import { SessionsPage } from './app/pages/SessionsPage';
import { SignInPage } from './app/pages/SignInPage';
import { SignUpPage } from './app/pages/SignUpPage';
import { VerifyEmailPage } from './app/pages/VerifyEmailPage';
import './styles/material.css';
import { useAuthStore } from './store/auth.store';

function App() {
  const auth = useAuthStore();

  if (auth.isAuthenticated) {
    if (auth.mode === 'sessions') {
      return <SessionsPage auth={auth} />;
    }

    return <MediaPage auth={auth} />;
  }

  if (auth.mode === 'signUp') {
    return <SignUpPage auth={auth} />;
  }

  if (auth.mode === 'forgotPassword') {
    return <ForgotPasswordPage auth={auth} />;
  }

  if (auth.mode === 'resetPassword') {
    return <ResetPasswordPage auth={auth} />;
  }

  if (auth.mode === 'verifyEmail') {
    return <VerifyEmailPage auth={auth} />;
  }

  return <SignInPage auth={auth} />;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
