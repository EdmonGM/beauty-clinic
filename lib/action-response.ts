export type ActionResponse<T> =
  | { success: true; data: T; message: string }
  | { success: false; error: any; message: string }

export function actionSuccess<T>(data: T, message: string): ActionResponse<T> {
  return {
    success: true,
    data: data,
    message: message,
  }
}
export function actionError<T>(error: any, message: string): ActionResponse<T> {
  return {
    success: false,
    error: error,
    message: message,
  }
}
