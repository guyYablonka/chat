import { RoomAccessValidator } from '../../sdk/types/IAuthorization';
import { Subscriptions } from './service';

export const shouldAccessRoom: RoomAccessValidator = async (
    room,
    user,
    extraData
): Promise<boolean> => {
    if (!room?._id || !user?._id) {
        return false;
    }

    return await Subscriptions.findOneByRoomIdAndUserId(room._id, user._id);
};
