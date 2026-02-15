import { Flex, type FlexProps } from '../../common/Flex';

export type GapSize = 'main' | 'secondary';
type ContainerProps = Omit<FlexProps, 'gap'> & {
    gap?: GapSize;
};

const gapMapping: Record<GapSize, number> = {
    main: 100,
    secondary: 60,
};

export const Contaier = ({ gap = 'secondary', ...props }: ContainerProps) => (
    <Flex gap={gapMapping[gap]} align="start" fullWidth {...props} />
);
