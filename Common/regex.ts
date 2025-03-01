export function validateUrl(url: string): boolean {
    return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(url);
}

export function validateImage(url: string): boolean {
    return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}
