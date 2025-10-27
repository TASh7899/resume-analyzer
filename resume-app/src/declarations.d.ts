declare module "../axiosConfig.js" {
  import type { AxiosInstance } from "axios"
  const api: AxiosInstance;
  export default api;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}


declare module "*.jsx";
declare module "*.css";

