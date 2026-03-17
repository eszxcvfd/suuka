import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MediaPage } from './app/pages/MediaPage';
import { SignInPage } from './app/pages/SignInPage';
import { useAuthStore } from './store/auth.store';

function App() {
  const auth = useAuthStore();

  return auth.isAuthenticated ? <MediaPage /> : <SignInPage auth={auth} />;
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
