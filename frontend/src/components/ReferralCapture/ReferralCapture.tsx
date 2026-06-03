import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { captureReferralFromSearch } from '@/lib/referral';

/**
 * Глобальный захват ?ref= из URL → cookie referral_code, затем удаление ref из адресной строки.
 * Без UI; монтируется один раз в AppWrapper.
 */
export const ReferralCapture = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const nextSearch = captureReferralFromSearch(location.search);

        if (nextSearch === null) {
            return;
        }

        navigate(
            {
                pathname: location.pathname,
                search: nextSearch,
                hash: location.hash,
            },
            { replace: true },
        );
    }, [location.pathname, location.search, location.hash, navigate]);

    return null;
};
