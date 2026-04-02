import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { useState } from 'react';

import styles from './Collapse.module.scss';

export type CollapseProps = {
    title: string;
    collapsed?: boolean;
    children: React.ReactNode;
};

export const Collapse = ({ title, collapsed = false, children }: CollapseProps) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    return (
        <Flex direction="column" align="stretch" gap={20} fullWidth className={styles.container}>
            <Flex direction="row" align="center" justify="between" fullWidth>
                <Text variant="20-med">{title}</Text>
                <Button
                    variant="outlined"
                    icon={isCollapsed ? 'plus' : 'minus'}
                    onlyIcon
                    onClick={() => setIsCollapsed(!isCollapsed)}
                />
            </Flex>
            {!isCollapsed && children}
        </Flex>
    );
};
