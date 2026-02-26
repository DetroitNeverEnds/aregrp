import { type PropsWithChildren } from 'react';
import { useSiteInfo } from '../../queries/siteInfo';
import _ from 'lodash';
import { Loader } from '../ui/common/Loader';
import Text from '../ui/common/Text';
import { Flex } from '../ui/common/Flex';
import { useUser } from '../../queries/profile';

export const QueryWaiter = (props: PropsWithChildren) => {
    const siteInfo = useSiteInfo();
    const user = useUser();

    // Ждём завершения всех запросов
    if (_.some([siteInfo.isPending, user.isPending])) {
        return <Loader variant="overlay" />;
    }

    // Fail if errors (только критичные запросы)
    if (siteInfo.data?.error) {
        return (
            <Flex align="center" justify="center" fullWidth>
                <Text variant="24-reg" color="error-default">
                    Error loading site: {siteInfo.data.error.detail}
                </Text>
            </Flex>
        );
    }

    return props.children;
};
