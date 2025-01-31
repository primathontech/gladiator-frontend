import { OpenAI } from '@langchain/openai';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OpenAI Credentials');
}

export const openai = new OpenAI({
    temperature: 0,
});
