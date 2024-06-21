import { Document } from 'langchain/document';

export type Message = {
    type: 'apiMessage' | 'userMessage';
    message: string;
    isStreaming?: boolean;
    sourceDocs?: Document[];
};

export type ClickOrPressEvent = {
    key?: string;
    type?: string;
    preventDefault: () => void;
    stopPropagation: () => void;
};
