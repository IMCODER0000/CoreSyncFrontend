export const TOPBAR_SET = "topbar:set";
export const TOPBAR_ACTION = "topbar:action";

export const setTopbar = (cfg: any) =>
    window.dispatchEvent(new CustomEvent(TOPBAR_SET, { detail: cfg}));

export const emitTopbarAction = (detail: { type: string; name?: string; payload?: any}) =>
    window.dispatchEvent(new CustomEvent(TOPBAR_ACTION, { detail }));