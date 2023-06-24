export function withoutTranslationPart(text: string): string {
  return text.split('=').at(-1).trim();
}
