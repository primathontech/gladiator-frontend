/* eslint-disable */
import { NEXT_PUBLIC_PINECONE_INDEX_NAME } from '@/config/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { question, history, selectedValue } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'No question in the request' });
    }
    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

    const index = pinecone.Index(NEXT_PUBLIC_PINECONE_INDEX_NAME);

    /* create vectorstore */
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
        pineconeIndex: index,
        textKey: 'text',
        namespace: selectedValue,
    });
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
    });

    const sendData = (data: string) => {
        res.write(`data: ${data}\n\n`);
    };

    sendData(JSON.stringify({ data: '' }));

    // create chain
    const chain = makeChain(vectorStore.asRetriever(), (token: string) => {
        sendData(JSON.stringify({ data: token }));
    });

    try {
        // Ask a question
        const response = await chain.call({
            question: sanitizedQuestion,
            chat_history: history || [],
        });

        sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }));
    } catch (error: any) {
    } finally {
        sendData('[DONE]');
        res.end();
    }
}

const formatChatHistory = (human: string, ai: string, previousChatHistory?: string) => {
    const newInteraction = `Human: ${human}\nAI: ${ai}`;
    if (!previousChatHistory) {
        return newInteraction;
    }

    return `${previousChatHistory}\n\n${newInteraction}`;
};
