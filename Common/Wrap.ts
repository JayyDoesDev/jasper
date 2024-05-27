export interface FluxResponse {
    id: string;
    file: string;
    success: boolean;
    code: number;
    message: string;
}

export async function Wrap<T>(promise: Promise<T>): Promise<Record<"data", T>> {
    const wrapped = await promise;
    return { data: wrapped }
}
