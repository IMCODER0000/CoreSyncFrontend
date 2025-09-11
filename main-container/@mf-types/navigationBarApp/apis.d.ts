
    export type RemoteKeys = 'navigationBarApp/App' | 'navigationBarApp/Sidebar' | 'navigationBarApp/Topbar';
    type PackageType<T> = T extends 'navigationBarApp/Topbar' ? typeof import('navigationBarApp/Topbar') :T extends 'navigationBarApp/Sidebar' ? typeof import('navigationBarApp/Sidebar') :T extends 'navigationBarApp/App' ? typeof import('navigationBarApp/App') :any;