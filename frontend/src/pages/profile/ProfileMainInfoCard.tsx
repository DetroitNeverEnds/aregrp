import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Icon } from '@/components/ui/common/Icon';
import FlatButton from '@/components/ui/common/FlatButton';
import { Card } from '@/components/ui/common/Card/Card';
import type { UserData } from '@/api';

import styles from './Profile.module.scss';
import { ProfileMainInfoView } from './ProfileMainInfoView';
import { ProfileMainInfoEditForm } from './ProfileMainInfoEditForm';

export const ProfileMainInfoCard = ({ user }: { user: UserData }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);

    return (
        <Card size="xl" direction="column" gap={30} className={styles.mainPanel} align="start">
            <Flex direction="row" justify="between" align="center" fullWidth wrap="wrap">
                <Text variant="24-med">{t('pages.profile.mainInfo')}</Text>
                {!isEditing && (
                    <FlatButton type="button" onClick={() => setIsEditing(true)}>
                        <Flex direction="row" gap={8} align="center">
                            <Icon name="edit" size={14} />
                            <Text variant="12-med" color="gray-70">
                                {t('pages.profile.edit')}
                            </Text>
                        </Flex>
                    </FlatButton>
                )}
            </Flex>

            {!isEditing ? (
                <ProfileMainInfoView user={user} />
            ) : (
                <ProfileMainInfoEditForm
                    user={user}
                    onSaved={() => setIsEditing(false)}
                    onCancel={() => setIsEditing(false)}
                />
            )}
        </Card>
    );
};
