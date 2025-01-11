export async function wrap<T>(promise: Promise<T>): Promise<Record<"data", T>> {
    const wrapped = await promise;
    return { data: wrapped }
}
