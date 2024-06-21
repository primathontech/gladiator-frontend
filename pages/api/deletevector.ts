/* eslint-disable */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    for (const option of req.body) {
        const head = {
            method: 'POST',
            url: `${process.env.NEXT_PUBLIC_PINECONE_INDEX_URL}/vectors/delete`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'Api-Key': process.env.NEXT_PUBLIC_PINECONE_API_KEY,
            },
            data: { deleteAll: true, namespace: option },
        };
        try {
            const response = await axios.request(head);
        } catch (err) {
            console.error(err);
        }
    }
}
