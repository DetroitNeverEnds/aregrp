import { type PropsWithChildren } from 'react';
import { useSiteInfo } from '../../queries/siteInfo';
import _ from 'lodash';
import { Loader } from '../ui/common/Loader';
import Text from '../ui/common/Text';

export const QueryWaiter = (props: PropsWithChildren) => {
    const siteInfo = useSiteInfo();
    // add more

    if (_.every([siteInfo.isPending])) {
        return <Loader />;
    }
    if (_.some([siteInfo.isError])) {
        return (
            <Text variant="24-reg" color="error-default">
                Error loading site
            </Text>
        );
    }
    return props.children;
};
