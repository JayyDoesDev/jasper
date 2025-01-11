import { Emojis } from "./enums";

export function RightArrowStringConfig(checkMark: string, string: string): string {
    return `**${ checkMark } ${ Emojis.RIGHT_ARROW } ${ string }**`;
}
