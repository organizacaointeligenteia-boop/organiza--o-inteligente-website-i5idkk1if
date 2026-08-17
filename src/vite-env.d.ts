/// <reference types="vite/client" />

declare module '*.xlsx' {
  const src: string
  export default src
}
declare module '*.pdf' {
  const src: string
  export default src
}
declare module '*.xlsx?url' {
  const src: string
  export default src
}
declare module '*.pdf?url' {
  const src: string
  export default src
}
