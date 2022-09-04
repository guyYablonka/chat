const viewModes = {
    extended: 60,
    medium: 36,
    condensed: 28
};

export const itemSizeMap = (sidebarViewMode: keyof typeof viewModes) => {
    return viewModes[sidebarViewMode];
};
