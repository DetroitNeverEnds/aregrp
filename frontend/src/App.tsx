import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
    const [count, setCount] = useState(0);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => changeLanguage('ru')} style={{ marginRight: '10px' }}>
                    Русский
                </button>
                <button onClick={() => changeLanguage('en')}>English</button>
            </div>
            <h1>{t('app.title')}</h1>
            <div className="card">
                <button onClick={() => setCount(count => count + 1)}>
                    {t('app.count', { count })}
                </button>
                <p>{t('app.edit')}</p>
            </div>
            <p className="read-the-docs">{t('app.learnMore')}</p>
        </>
    );
}

export default App;
