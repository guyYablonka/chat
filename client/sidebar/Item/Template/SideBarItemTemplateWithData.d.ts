import { BoxProps } from '@rocket.chat/fuselage';
import { ItemData } from '../../RoomList/RoomList';
import { ISubscription } from '/definition/ISubscription';

type TemplateProps = BoxProps &
    ItemData & {
        id: string;
        room: ISubscription;
        selected: boolean;
        fullName?: string;
    };

declare const SideBarItemTemplateWithData: React.NamedExoticComponent<TemplateProps>;

export default SideBarItemTemplateWithData;
