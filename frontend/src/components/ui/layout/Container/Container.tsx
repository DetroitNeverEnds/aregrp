import { Flex, type FlexProps } from '../../common/Flex';

export type GapSize = 'main' | 'regular';
type ContainerProps = Omit<FlexProps, 'gap'> & {
    gap?: GapSize;
};

const gapMapping: Record<GapSize, number> = {
    main: 100,
    regular: 60,
};

export const Container = ({ gap = 'regular', ...props }: ContainerProps) => (
    <Flex gap={gapMapping[gap]} align="start" fullWidth {...props} />
);
