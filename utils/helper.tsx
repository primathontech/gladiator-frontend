export const renderMessageContent = (content: string) => {
    const normalizedContent = content.replace(/\n\n/g, '\n');
    const lines = normalizedContent.split('\n');

    return lines.map((line, index) => [
        <span key={`line-${index}`}>{line}</span>,
        index !== lines.length - 1 && <br key={`br-${index}`} />,
    ]);
};
