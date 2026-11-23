import { fail, type ActionResult } from "@/lib/result";

export async function runAction<T>(
  fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Terjadi kesalahan");
  }
}
