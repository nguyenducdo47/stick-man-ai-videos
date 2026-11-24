/** Strip Qwen-style thinking blocks and extract JSON object/array from model text. */
export function extractJsonText(raw: string): string {
  let text = raw.trim();
  text = text.replace(/[\s\S]*?<\/think>/gi, '').trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    return fence[1].trim();
  }
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const start =
    firstBrace === -1
      ? firstBracket
      : firstBracket === -1
        ? firstBrace
        : Math.min(firstBrace, firstBracket);
  if (start === -1) {
    return text;
  }
  return text.slice(start);
}