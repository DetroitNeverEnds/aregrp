import { useLocation } from 'react-router-dom';

const useGetAuthLink = (page: string) => {
    const location = useLocation();
    return (
        `/auth/${page}` +
        (location.pathname.startsWith('/auth')
            ? ''
            : `?redirect=${encodeURIComponent(location.pathname + location.search)}`)
    );
};

export const useLoginLink = () => {
    return useGetAuthLink('login');
};

export const useRegisterLink = () => {
    return useGetAuthLink('register');
};
