import { Flex } from '../Flex';
import { Link } from '../Link';
import Text from '../Text';

export type BreadCrumbsDescription = { to: string; label: string }[];
export type BreadCrumbsProps = {
    breadcrumbs: BreadCrumbsDescription;
};
export const BreadCrumbs = (props: BreadCrumbsProps) => {
    return (
        <Flex direction="row" gap={10}>
            {props.breadcrumbs.map(({ to, label }) => (
                <Flex direction="row" key={to} gap={10}>
                    <Link to={to}>{label}</Link>
                    <Text>/</Text>
                </Flex>
            ))}
        </Flex>
    );
};
