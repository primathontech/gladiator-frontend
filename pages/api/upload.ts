/* eslint-disable */
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { PDFDocument } from 'pdf-lib';
import { run } from '../../scripts/ingest-data';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(400).json({ message: 'Bad request' });
    }
    try {
        const data: any = await new Promise((resolve, reject) => {
            const form = new IncomingForm();

            form.parse(req, async (err: any, fields: any, files: any) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });

        const contents = await fs.readFile(data?.files?.pdf.filepath);
        const pdfDoc = await PDFDocument.load(contents);
        const done = await fs.writeFile(`docs/${data?.files?.pdf.originalFilename}`, contents);
        await run(data?.files?.pdf.originalFilename);
        await fs.unlink(`docs/${data?.files?.pdf.originalFilename}`);
    } catch (e) {
        console.error(e);

        return res.status(400).json({ message: 'Uploading failed!' });
    }

    return res.status(200).json({ message: 'succ!' });
}
