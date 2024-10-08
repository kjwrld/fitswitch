declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    REACT_APP_PUBLIC_URL: string;
    PUBLIC_URL: string;
  }
}
