
export default function formatMath(text) {
    return (
      text
        // 1. Handle Block Math: \[ ... \] or [ ... ] (on its own line)
        .replace(/\\\[|(?<=\\n)\[(?=.*\\])/g, "$$")
        .replace(/\\\]|(?<=.*\[)\](?=\\n|$)/g, "$$")
        // 2. Handle Inline Math: \( ... \) or ( F )
        .replace(/\\\(|(?<=\s)\((?=[a-zA-Z0-9\s]{1,3}\))/g, "$")
        .replace(/\\\)|(?<=\$[a-zA-Z0-9\s]{1,3})\)/g, "$")
    );
};