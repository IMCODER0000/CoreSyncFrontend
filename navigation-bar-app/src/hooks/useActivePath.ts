import { useEffect, useState } from "react";

export function useActivePath() {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const onPop = () => setPath(window.location.pathname);
        window.addEventListener("popstate", onPop);

        const origPush = history.pushState;
        history.pushState = function (...args) {
            const ret = origPush.apply(this, args as any);
            setPath(window.location.pathname);
            return ret;
        };

        return () => {
            window.removeEventListener("popstate", onPop);
            history.pushState = origPush;
        };
    }, []);

    return path;
}
