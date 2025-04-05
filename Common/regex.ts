export function validateUrl(url: string): boolean {
    return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(url);
}

export function validateImage(url: string): boolean {
    return /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

export function validateEmoji(emoji: string): boolean {
    const regex = /<a?:\w{2,32}:\d{17,20}>|(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

    return regex.test(emoji);
}
