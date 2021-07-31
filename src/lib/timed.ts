export async function timed<T>(action: () => Promise<T>): Promise<[T, number]> {
  const startTime = Date.now();

  const result = await action();

  const endTime = Date.now();

  return [result, endTime - startTime];
}
