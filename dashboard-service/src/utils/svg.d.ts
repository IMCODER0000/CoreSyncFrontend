// src/utils/svg.d.ts
// SVG를 두 가지 방식으로 import 할 수 있게 선언:
// 1) 기본(default): React 컴포넌트  (색/선두께 제어 가능)
// 2) '?url'        : 문자열 URL      (파일 경로가 필요할 때)

declare module "*.svg" {
    import * as React from "react";
    // 기본(default) 내보내기는 React 컴포넌트로 취급
    const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    export default ReactComponent;

    // 필요하면 named export로도 쓸 수 있게 유지
    export { ReactComponent };
}

declare module "*.svg?url" {
    const src: string;
    export default src;
}
