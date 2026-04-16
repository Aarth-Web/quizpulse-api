import { useToastStore } from "../components/toastStore";

export function notifySuccess(message: string) {
  useToastStore.getState().addToast(message, "success");
}

export function notifyError(message: string) {
  useToastStore.getState().addToast(message, "error");
}

export function notifyInfo(message: string) {
  useToastStore.getState().addToast(message, "info");
}
