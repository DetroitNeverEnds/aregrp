import { useCallback } from 'react';
import { FloorSchema, type FloorRoom } from '@/components/ui/building/FloorSchema';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import type { FloorResponseOut } from '@/api';
import { parseBuildingSearchParams } from './buildingSearchParams';

type FloorSchemaContentProps = {
    data: FloorResponseOut;
};

export const FloorSchemaContent = (props: FloorSchemaContentProps) => {
    const floorData = props.data;

    const [{ selectedPremise }, rawParams, setSearchParams] =
        useTypedSearchParams(parseBuildingSearchParams);

    const onPremiseSelect = useCallback(
        (room: FloorRoom) => {
            const isAlreadySelected = room.uuid === selectedPremise;
            if (isAlreadySelected) {
                const { selectedPremise: _, ...rest } = rawParams;
                setSearchParams(rest);
            } else {
                setSearchParams({
                    ...rawParams,
                    selectedPremise: room.uuid,
                });
            }
        },
        [rawParams, selectedPremise, setSearchParams],
    );

    return (
        <FloorSchema
            svg={props.data.schema_svg || ''}
            rooms={floorData.premises ?? []}
            selectedPremiseId={selectedPremise}
            onRoomSelect={onPremiseSelect}
        />
    );
};
