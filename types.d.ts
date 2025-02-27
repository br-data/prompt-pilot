declare module '*.woff';
declare module '*.woff2';
declare module '*.jpg';
declare module '*.png';
declare module '*.gif';
declare module 'cors';
declare module "*.svg" {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
  }

