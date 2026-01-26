import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from './pages/auth/layout';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import ForgotPassword from './pages/auth/forgot-password';
import RestorePassword from './pages/auth/restore-password';

function App() {
    return (
        <Routes>
            <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="restore-password" element={<RestorePassword />} />
            </Route>
        </Routes>
    );
}

export default App;
