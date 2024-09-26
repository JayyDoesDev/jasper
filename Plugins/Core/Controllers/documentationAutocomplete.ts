import { Nullable } from "../../../Common/Nullable";

type DocumentationItem = {
    name: string;
    value: string;
  }

/**
 * Autocomplete topics and subtopics from the documentation content.
 * @param content The documentation content.
 * @returns An array of objects with "name" and "value" fields.
 */

export function documentationAutocomplete(content: string): DocumentationItem[] {
    const lines = content.split('\n');
    const result: DocumentationItem[] = [];
    let currentTopic: Nullable<string> = null;
    let currentSubtopic: Nullable<string> = null;
    let currentContent: string[] = [];

    const addCurrentItem = () => {
        if (currentSubtopic && currentContent.length > 0) {
            result.push({
                name: `${currentTopic} > ${currentSubtopic}`,
                value: currentContent.join('\n').trim()
            });
        } else if (currentTopic && !currentSubtopic && currentContent.length > 0) {
            result.push({
                name: currentTopic,
                value: currentContent.join('\n').trim()
            });
        }
    };

    for (const line of lines) {
        if (line.startsWith('## ')) {
            addCurrentItem();
            currentTopic = line.substring(3).trim();
            currentSubtopic = null;
            currentContent = [];
        } else if (line.startsWith('### ')) {
            addCurrentItem();
            currentSubtopic = line.substring(4).trim();
            currentContent = [];
        } else if (line.trim().length > 0) {
            currentContent.push(line);
        }
    }
    addCurrentItem();
    return result;
}