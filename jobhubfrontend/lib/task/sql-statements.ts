/** Split complete SQL statements, never physical lines or quoted/commented semicolons. */
export function sqlStatementsFromPaste(source: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let hasCode = false;
  let quote: string | null = null;
  let dollarQuote: string | null = null;
  let lineComment = false;
  let commentDepth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n" || char === "\r") lineComment = false;
      continue;
    }
    if (commentDepth) {
      if (char === "/" && next === "*") {
        commentDepth += 1;
        index += 1;
      } else if (char === "*" && next === "/") {
        commentDepth -= 1;
        index += 1;
      }
      continue;
    }
    if (dollarQuote) {
      if (source.startsWith(dollarQuote, index)) {
        index += dollarQuote.length - 1;
        dollarQuote = null;
      }
      continue;
    }
    if (quote) {
      if (char === quote) {
        if (next === quote) index += 1;
        else quote = null;
      }
      continue;
    }
    if (char === "-" && next === "-") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      commentDepth = 1;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === "`" || char === "[") {
      quote = char === "[" ? "]" : char;
      hasCode = true;
      continue;
    }
    if (char === "$") {
      const delimiter = source
        .slice(index)
        .match(/^\$(?:[a-zA-Z_][a-zA-Z_0-9]*)?\$/)?.[0];
      if (delimiter) {
        dollarQuote = delimiter;
        hasCode = true;
        index += delimiter.length - 1;
        continue;
      }
    }
    if (char === ";") {
      if (hasCode) statements.push(source.slice(start, index + 1).trim());
      start = index + 1;
      hasCode = false;
    } else if (!/\s/.test(char)) hasCode = true;
  }
  if (hasCode) statements.push(source.slice(start).trim());
  return statements;
}
