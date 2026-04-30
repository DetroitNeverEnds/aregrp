import classNames from 'classnames';
import { Flex } from '@/components/ui/common/Flex';
import { Link } from '@/components/ui/common/Link';
import Text from '@/components/ui/common/Text';

import styles from './Breadcrumbs.module.scss';

export type BreadCrumbsDescription = { to: string; label: string }[];
export type BreadCrumbsProps = {
    breadcrumbs: BreadCrumbsDescription;
};
export const BreadCrumbs = (props: BreadCrumbsProps) => {
    return (
        <Flex direction="row" gap={10}>
            {props.breadcrumbs.map(({ to, label }, i) => (
                <Flex direction="row" key={to} gap={10}>
                    <Link
                        className={classNames({
                            [styles.secondary]: i !== props.breadcrumbs.length - 1,
                        })}
                        to={to}
                    >
                        {label}
                    </Link>
                    {i !== props.breadcrumbs.length - 1 && (
                        <Text
                            className={classNames({
                                [styles.secondary]: i !== props.breadcrumbs.length - 2,
                            })}
                        >
                            /
                        </Text>
                    )}
                </Flex>
            ))}
        </Flex>
    );
};
