import { NEXT_PUBLIC_PINECONE_INDEX_NAME } from '@/config/pinecone';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { pinecone } from '@/utils/pinecone-client';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/* Name of directory to retrieve your files from */
const filePath = 'docs';

export const run = async (namespace: string) => {
    try {
        /* load raw docs from the all files in the directory */
        const directoryLoader = new DirectoryLoader(filePath, {
            '.pdf': (path) => new CustomPDFLoader(path),
        });

        // const loader = new PDFLoader(filePath);
        const rawDocs = await directoryLoader.load();

        /* Split text into chunks */
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const docs = await textSplitter.splitDocuments(rawDocs);
        /* create and store the embeddings in the vectorStore */
        const embeddings = new OpenAIEmbeddings();
        const index = pinecone.Index(NEXT_PUBLIC_PINECONE_INDEX_NAME); // change to your own index name

        // embed the PDF documents
        await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex: index,
            namespace,
            textKey: 'text',
        });
    } catch (error) {
        throw new Error('Failed to ingest your data');
    }
};

// (async () => {
//   await run();
//   console.log('ingestion complete');
// })();
