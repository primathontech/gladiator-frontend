import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const options = {
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_PINECONE_INDEX_URL}/describe_index_stats`,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'Api-Key': process.env.NEXT_PUBLIC_PINECONE_API_KEY,
        },
    };
    try {
        const response = await axios.request(options);
        res.setHeader('Content-Type', 'application/json');
        res.status(200);
        if (response?.data?.namespaces) res.send(Object.keys(response.data.namespaces));
    } catch (err) {
        console.error(err);
    }
}
