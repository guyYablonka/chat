import { IRocketChatRecord } from './IRocketChatRecord';
import { IUser } from './IUser';
import { UiKitBannerPayload } from './UIKit';

export enum BannerPlatform {
    Web = 'web',
    Mobile = 'mobile'
}
export interface IBanner extends IRocketChatRecord {
    platform: BannerPlatform[]; // pĺatforms a banner could be shown
    expireAt: Date; // date when banner should not be shown anymore
    startAt: Date; // start date a banner should be presented
    roles?: string[]; // only show the banner to this roles
    createdBy: Pick<IUser, '_id' | 'username'>;
    createdAt: Date;
    view: UiKitBannerPayload;
}

export interface IBannerDismiss extends IRocketChatRecord {
    userId: IUser['_id']; // user receiving the banner dismissed
    bannerId: IBanner['_id']; // banner dismissed
    dismissedAt: Date; // when is was dismissed
    dismissedBy: Pick<IUser, '_id' | 'username'>; // who dismissed (usually the same as userId)
}
