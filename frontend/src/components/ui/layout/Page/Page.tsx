import { useEffect, type PropsWithChildren } from 'react';

export const Page = (props: PropsWithChildren) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return props.children;
};
