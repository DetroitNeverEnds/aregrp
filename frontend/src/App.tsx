import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from './pages/auth/layout';
import Login from './pages/auth/login';
import Register from './pages/auth/register';

function App() {
    return (
        <Routes>
            <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Route>
        </Routes>
    );
}

export default App;
