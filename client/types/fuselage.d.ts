declare module '@rocket.chat/fuselage-tokens/colors' {
    type ColorsType = {
        [key: string]: string;
    };

    const Colors: ColorsType;
    export default Colors;
}

declare module '@rocket.chat/fuselage' {
    import { Placements } from '@rocket.chat/fuselage-hooks';
    import {
        ComponentProps,
        ElementType,
        ForwardRefExoticComponent,
        RefObject,
        KeyboardEvent,
        FormEvent,
        PropsWithChildren,
        ReactNode
    } from 'react';

    type AccordionItemProps = Omit<ComponentProps<typeof Box>, 'title'> & {
        children?: ReactNode;
        className?: string;
        defaultExpanded?: boolean;
        disabled?: boolean;
        expanded?: boolean;
        tabIndex?: number;
        title: ReactNode;
        noncollapsible?: boolean;
        onToggle?: (e: MouseEvent | KeyboardEvent) => void;
        onToggleEnabled?: (e: FormEvent) => void;
    };

    export const Accordion: ForwardRefExoticComponent<AccordionProps> & {
        Item: ForwardRefExoticComponent<AccordionItemProps>;
    };

    type AnimatedVisibilityProps = PropsWithChildren<{
        visibility?: 'hidden' | 'visible' | 'hiding' | 'unhiding';
    }>;

    export const AnimatedVisibility: {
        (props: AnimatedVisibilityProps): JSX.Element;
        HIDDEN: 'hidden';
        VISIBLE: 'visible';
        HIDING: 'hiding';
        UNHIDING: 'unhiding';
    };

    type AutoCompleteProps = {
        value: string | number | readonly string[] | undefined;
        filter: string;
        setFilter?: (filter: string) => void;
        options?: {
            label: string;
            value: AutoCompleteProps['value'];
        }[];
        renderItem: (props: unknown) => JSX.Element;
        renderSelected?: ElementType;
        onChange: (
            value: AutoCompleteProps['value'],
            action?: 'remove' | undefined
        ) => void;
        getLabel?: (option: {
            label: string;
            value: AutoCompleteProps['value'];
        }) => string;
        getValue?: (option: {
            label: string;
            value: AutoCompleteProps['value'];
        }) => unknown;
        renderEmpty?: (props: unknown) => JSX.Element;
        placeholder?: string;
        error?: boolean;
        disabled?: boolean;
    };
    export const AutoComplete: (props: AutoCompleteProps) => JSX.Element;

    type OptionsProps = {
        multiple?: boolean;
        options: [unknown, string, boolean?][];
        cursor: number;
        renderItem?: ElementType;
        renderEmpty?: ElementType;
        onSelect: (option: [unknown, string]) => void;
    } & Omit<ComponentProps<typeof Box>, 'onSelect'>;

    export const Options: ForwardRefExoticComponent<OptionsProps> & {
        AvatarSize: ComponentProps<typeof Avatar>['size'];
    };

    type TabsProps = ComponentProps<typeof Box>;

    export const Tabs: ForwardRefExoticComponent<TabsProps> & {
        Item: ForwardRefExoticComponent<TabsItemProps>;
    };

    type TabsItemProps = {
        selected?: boolean;
        disabled?: boolean;
    } & ComponentProps<typeof Box>;
    export const TabsItem: ForwardRefExoticComponent<TabsItemProps>;

    type TooltipProps = {
        placement:
            | 'top-start'
            | 'top-middle'
            | 'top-end'
            | 'bottom-start'
            | 'bottom-middle'
            | 'bottom-end'
            | 'left-start'
            | 'left-middle'
            | 'left-end'
            | 'right-start'
            | 'right-middle'
            | 'right-end'
            | 'top'
            | 'left'
            | 'bottom'
            | 'right';
    };
    export const Tooltip: ForwardRefExoticComponent<TooltipProps>;

    type SidebarProps = ComponentProps<typeof Box>;
    type SidebarTopBarProps = ComponentProps<typeof Box>;
    type SidebarTopBarActionProps = ComponentProps<typeof ActionButton>;
    type SidebarItemProps = ComponentProps<typeof Box>;
    type SidebarSectionProps = ComponentProps<typeof Box>;

    export const Sidebar: ForwardRefExoticComponent<SidebarProps> & {
        TopBar: ForwardRefExoticComponent<SidebarTopBarProps> & {
            Wrapper: ForwardRefExoticComponent<SidebarTopBarProps>;
            Avatar: ForwardRefExoticComponent<ComponentProps<typeof Avatar>>;
            Actions: ForwardRefExoticComponent<SidebarTopBarProps>;
            Action: ForwardRefExoticComponent<
                ComponentProps<typeof ActionButton>
            >;
            Divider: ForwardRefExoticComponent<SidebarTopBarProps>;
            Title: ForwardRefExoticComponent<SidebarTopBarProps>;
            ToolBox: ForwardRefExoticComponent<SidebarTopBarProps>;
            Section: ForwardRefExoticComponent<SidebarTopBarProps>;
        };
        Item: ForwardRefExoticComponent<SidebarItemProps> & {
            Menu: ForwardRefExoticComponent<ComponentProps<typeof Menu>>;
            Container: ForwardRefExoticComponent<SidebarItemProps>;
            Content: ForwardRefExoticComponent<SidebarItemProps>;
            Title: ForwardRefExoticComponent<SidebarItemProps>;
            Subtitle: ForwardRefExoticComponent<SidebarItemProps>;
            Time: ForwardRefExoticComponent<SidebarItemProps>;
            Wrapper: ForwardRefExoticComponent<SidebarItemProps>;
            Icon: ForwardRefExoticComponent<ComponentProps<typeof Icon>>;
            Avatar: ForwardRefExoticComponent<ComponentProps<typeof Avatar>>;
            Actions: ForwardRefExoticComponent<SidebarItemProps>;
            Action: ForwardRefExoticComponent<
                ComponentProps<typeof ActionButton>
            >;
            Badge: ForwardRefExoticComponent<ComponentProps<typeof Badge>>;
        };
        Section: ForwardRefExoticComponent<SidebarSectionProps> & {
            Title: ForwardRefExoticComponent<SidebarSectionProps>;
        };
    };

    export function useVisible(
        initialVisibility:
            | typeof AnimatedVisibility.HIDDEN
            | typeof AnimatedVisibility.HIDING
            | typeof AnimatedVisibility.VISIBLE
            | typeof AnimatedVisibility.UNHIDING
    ): [typeof initialVisibility, () => void, () => void];

    export function useCursor(
        initial: number | string,
        options: Pick<
            ComponentProps<typeof Option>,
            'value' & 'label' & 'selected'
        >,
        onChange: (
            option: Pick<
                ComponentProps<typeof Option>,
                'value' & 'label' & 'selected'
            >,
            visibilityHandler: ReturnType<typeof useVisible>
        ) => void
    ): [
        number,
        (e: KeyboardEvent<HTMLOrSVGElement>) => void,
        (e: KeyboardEvent<HTMLOrSVGElement>) => void,
        () => void,
        ReturnType<typeof useVisible>
    ];

    type PositionProps = {
        anchor?: RefObject<Element>;
        placement?: Placements;
    } & ComponentProps<typeof Box>;

    export const Position: (props: PositionProps) => JSX.Element;

    type PositionAnimatedProps = {
        visible?: 'hidden' | 'visible' | 'hiding' | 'unhiding';
    } & ComponentProps<typeof Position>;

    export const PositionAnimated: (
        props: PositionAnimatedProps
    ) => JSX.Element;
}
