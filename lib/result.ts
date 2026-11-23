export type ActionResult<T = undefined> =
  | { ok: true; message: string; data: T }
  | { ok: false; message: string };

export function ok<T = undefined>(message = "Berhasil", data?: T): ActionResult<T> {
  return { ok: true, message, data: data as T };
}

export function fail(message: string): ActionResult<never> {
  return { ok: false, message };
}
