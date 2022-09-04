import { BaseItemProps } from '../types/baseItem';

declare const Extended: React.NamedExoticComponent<
    BaseItemProps & { selected: boolean; subtitle?: string }
>;
export default Extended;
