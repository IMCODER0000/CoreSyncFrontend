declare module "*.png"  { const src: string; export default src; }
declare module "*.jpg"  { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.gif"  { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }
declare module "*.svg"  {
    const src: string; export default src;
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}
