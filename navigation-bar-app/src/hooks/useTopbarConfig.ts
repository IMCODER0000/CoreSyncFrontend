import { useEffect, useState } from "react";
import { TOPBAR_SET } from "../utils/topbarBus.ts";
import type { TopbarConfig } from "../utils/types.ts";

export function useTopbarConfig(defaults?: TopbarConfig){
    const [cfg, setCfg] = useState<TopbarConfig>(defaults ?? { center: { kind: "text", text: "Dashboard"}});
    useEffect(() => {
        const h = (e: Event) => setCfg((e as CustomEvent).detail);
        window.addEventListener(TOPBAR_SET, h as EventListener);

        return () => window.removeEventListener(TOPBAR_SET,h as EventListener);
    }, []);
    return cfg;
}