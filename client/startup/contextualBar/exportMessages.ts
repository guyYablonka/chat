import { useMemo, lazy, LazyExoticComponent, FC } from 'react';

import { addAction } from '../../views/room/lib/Toolbox';
import { usePermission } from '../../contexts/AuthorizationContext';
import { useSetting } from '/client/contexts/SettingsContext';

addAction('export-messages', ({ room }) => {
    const hasPermission = usePermission('mail-messages', room._id);
    const isEnabled = useSetting('Allow_Export_Messages');
    return useMemo(
        () =>
            isEnabled && hasPermission
                ? {
                      groups: ['channel', 'group', 'direct'],
                      id: 'export-messages',
                      anonymous: true,
                      title: 'Export_Messages',
                      icon: 'mail',
                      template: lazy(
                          () =>
                              import(
                                  '../../views/room/contextualBar/ExportMessages'
                              )
                      ) as LazyExoticComponent<FC>,
                      full: true,
                      order: 12
                  }
                : null,
        [hasPermission]
    );
});
