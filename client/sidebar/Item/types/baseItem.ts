export type BaseItemProps = {
    icon: JSX.Element;
    title?: string;
    avatar: JSX.Element;
    actions: React.ReactNode;
    href: string;
    unread: boolean;
    badges: React.ReactNode;
    indicators: React.ReactNode;
    threadUnread: boolean;
    time: string;
    fullName?: string;
};
