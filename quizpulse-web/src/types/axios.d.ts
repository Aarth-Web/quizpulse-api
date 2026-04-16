import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    notifySuccessMessage?: string;
    skipGlobalErrorToast?: boolean;
  }
}
