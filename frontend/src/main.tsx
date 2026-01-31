import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/config';
import App from './App.tsx';
import { AppWrapper } from './components/AppWrapper';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppWrapper>
            <App />
        </AppWrapper>
    </StrictMode>,
);
