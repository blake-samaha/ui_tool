declare module 'vanta/dist/vanta.birds.min.js' {
  const BIRDS: any;
  export default BIRDS;
}

declare module 'three';

declare module 'dompurify' {
  const DOMPurify: { sanitize: (dirty: string) => string };
  export default DOMPurify;
}
