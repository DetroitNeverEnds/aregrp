import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from './pages/auth/layout';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import ForgotPassword from './pages/auth/forgot-password';
import RestorePassword from './pages/auth/restore-password';
import { MainLayout } from './components/ui/layout/MainLayout/Layout';
import { Root } from './pages/root';
import { Contacts } from './pages/contacts';
import { Catalogue } from './pages/catalogue';
import { Investors } from './pages/investors';
import { Agents } from './pages/agents';
import { Cases } from './pages/cases';
import { BuildingPage } from '@/pages/building';

function App() {
    return (
        <Routes>
            <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="restore-password" element={<RestorePassword />} />
            </Route>
            <Route path="/" element={<MainLayout />}>
                <Route path="/" element={<Root />} />
                <Route path="/catalogue" element={<Catalogue />} />
                <Route path="/investors" element={<Investors />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/building/:buildingUuid" element={<BuildingPage />} />
            </Route>
        </Routes>
    );
}

export default App;
