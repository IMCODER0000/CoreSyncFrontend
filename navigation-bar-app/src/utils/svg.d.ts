declare module "*.svg" {
    import * as React from "react";
    // SVGR 기본 타입과 동일하게 맞춤
    const content: React.FC<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    export default content;
}

declare module "*.svg?url" {
    const src: string;
    export default src;
}
