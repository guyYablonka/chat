import { useMemo, lazy } from 'react';

import { addAction } from '../../../../client/views/room/lib/Toolbox';
import { usePermission } from '../../../../client/contexts/AuthorizationContext';
import { useSetting } from '/client/contexts/SettingsContext';

const template = lazy(
    () => import('../../../../client/views/room/contextualBar/PruneMessages')
);

addAction('clean-history', ({ room }) => {
    const hasPermission = usePermission('clean-channel-history', room._id);
    const isEnabled = useSetting('Allow_Prune_Messages');
    return useMemo(
        () =>
            hasPermission && isEnabled
                ? {
                      groups: ['channel', 'group', 'direct'],
                      id: 'clean-history',
                      full: true,
                      title: 'Prune_Messages',
                      icon: 'eraser',
                      template,
                      order: 250
                  }
                : null,
        [hasPermission]
    );
});
