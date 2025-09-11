export type NavItem = { label: string; href: string; icon?: string; match?: "startsWith" | "exact"};

export type TopbarText = { kind: "text"; text: string };
export type TopbarTabs = { kind:"tabs"; tabs: Array<{ label: string; value: string }>; active: string };
export type TopbarIcons = { kind:"icons"; items: Array<"search" | "bell" | "avatar" | "plus"> };
export type TopbarSearch = { kind:"search"; placeholder?: string };

export type TopbarConfig = {
    center?: TopbarText | TopbarTabs;
    right?: | TopbarIcons | TopbarSearch | (TopbarIcons & TopbarSearch);
};