import { useLocation } from 'react-router-dom';

const useGetAuthLink = (page: string) => {
    const location = useLocation();
    const redirectPath = location.pathname + location.search + location.hash;
    return (
        `/auth/${page}` +
        (location.pathname.startsWith('/auth')
            ? ''
            : `?redirect=${encodeURIComponent(redirectPath)}`)
    );
};

export const useLoginLink = () => {
    return useGetAuthLink('login');
};

export const useRegisterLink = () => {
    return useGetAuthLink('register');
};
