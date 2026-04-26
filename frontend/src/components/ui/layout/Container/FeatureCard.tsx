import classNames from 'classnames';
import { Flex, type FlexProps } from '@/components/ui/common/Flex';

import styles from './FeatureCard.module.scss';

export const FeatureCard = ({ className, ...props }: FlexProps) => {
    return <Flex className={classNames(className, styles.card)} fullWidth {...props} />;
};
