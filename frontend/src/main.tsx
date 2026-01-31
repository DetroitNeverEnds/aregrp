import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/config';
import App from './App.tsx';
import { AppWrapper } from './components/AppWrapper';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AppWrapper>
                <App />
            </AppWrapper>
        </BrowserRouter>
    </StrictMode>,
);
