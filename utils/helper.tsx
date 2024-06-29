
export const renderMessageContent = (content: string) => {
    const normalizedContent = content.replace(/\n\n/g, '\n');
    const lines = normalizedContent.split('\n');
    const endsWithNewline = content.endsWith('\n');

    return lines
        .flatMap((line, index) => [
            <span key={`line-${index}`}>{line}</span>,
            index !== lines.length - 1 || endsWithNewline ? <br key={`br-${index}`} /> : null,
        ])
        .filter(Boolean);
};
