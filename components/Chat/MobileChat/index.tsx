/* eslint-disable import/no-extraneous-dependencies */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Typing from 'react-typing-animation';
import { toast, ToastContainer } from 'react-toastify';

import { Message, ClickOrPressEvent } from 'types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Document } from 'langchain/document';

// import PDFGPT_LOGO from '@public/Images/svgs/Curio.ai.svg';
import DOCUMENT_UPLOAD from '@public/Images/svgs/document-upload.svg';
import MENU from '@public/Images/svgs/menu.svg';
import AI_AVATAR from '@public/Images/pngs/AIAvatar.png';
import NO_RECORD from '@public/Images/pngs/no-record.png';
import DOCUMENT_UPLOAD1 from '@public/Images/pngs/document-upload1.png';
// import REGENERATE from '@public/Images/svgs/regenerate.svg';
import SUBMIT_ICON from '@public/Images/svgs/submit.svg';
import USERICON_IMAGE from '@public/Images/pngs/usericon.png';

import LoadingDots from '@components/ui/LoadingDots';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@components/ui/accordion';
import ShimmerUiContainer from '@components/ShimmerContainer';
import UploadPDFModal from '@/components/UploadPDFModal';
import { APP_URL } from '@/components/appConstant';

import { useRouter } from 'next/router';
import styles from './styles.module.scss';

const MobileChat = () => {
    const [query, setQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [sourceDocs] = useState<Document[]>([]);
    // const [error, setError] = useState<string | null>(null);
    const [messageState, setMessageState] = useState<{
        messages: Message[];
        pending?: string;
        history: [string, string][];
        pendingSourceDocs?: Document[];
    }>({
        messages: [
            {
                // message: "Hi, What would you like to learn?",
                message:
                    'curio.ai ensures 100% accurate data extraction from PDFs, utilizing advanced natural language processing for precise information retrieval and document analysis.',
                type: 'apiMessage',
            },
        ],
        history: [],
        pendingSourceDocs: [],
    });
    const router = useRouter();
    const type = router.route;
    let type1;
    if (type === '/chat') {
        type1 = 'Management';
    }
    const [selectedValue, setSelectedValue] = useState(type1);
    const [selectedPdf, setSelectedPdf] = useState('');
    // const [options, setOptions] = useState<string[]>([]);
    const [pdfOptions, setPdfOptions] = useState([]);
    // const [selectedCard, setSelectedCard] = useState(null);
    const [selectedPdfCard, setSelectedPdfCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // const [previousUserText, setPreviousUserText] = useState('');
    const [hamburger, setHamburger] = useState(false);

    // Add a state to track whether the response has been received from the API
    // const [responseReceived, setResponseReceived] = useState(false);

    const { messages, pending, history, pendingSourceDocs } = messageState;

    const messageListRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // const handleClickCategory = (index: any, data: any) => {
    //     setSelectedCard(index);
    //     setSelectedPdfCard(null);
    //     setSelectedPdf("");
    //     setSelectedValue(data);
    //     setMessageState({
    //         messages: [
    //             {
    //                 message: "Hi, What would you like to learn?",
    //                 type: "apiMessage",
    //             },
    //         ],
    //         history: [],
    //         pendingSourceDocs: [],
    //         pending: undefined,
    //     });
    // };

    const handleClickPdf = (index: any, data: any) => {
        setSelectedPdfCard(index);
        setHamburger(!hamburger);
        // setSelectedCard(null);
        setSelectedValue('');
        setSelectedPdf(data);
        setMessageState({
            messages: [
                {
                    message: 'Hi, What would you like to learn?',
                    type: 'apiMessage',
                },
            ],
            history: [],
            pendingSourceDocs: [],
            pending: undefined,
        });
    };

    // async function handleRegenerateSubmit(e: ClickOrPressEvent) {
    //     e.preventDefault();
    //     // setError(null);
    //     if (!previousUserText) {
    //         toast.error('Please input a question');
    //         setLoading(false);
    //         setResponseReceived(true);

    //         return;
    //     }

    //     setPreviousUserText(previousUserText.trim());
    //     setResponseReceived(true);
    //     const question = previousUserText.trim();

    //     setMessageState((state) => ({
    //         ...state,
    //         messages: state.messages.slice(0, -1),
    //         pending: undefined,
    //     }));

    //     setLoading(true);
    //     setQuery('');
    //     setMessageState((state) => ({ ...state, pending: '' }));

    //     const ctrl = new AbortController();

    //     try {
    //         fetchEventSource(`${APP_URL}/api/chat`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 question,
    //                 history,
    //                 selectedValue: selectedValue
    //                     || `UUF_${selectedPdf}`, // Send selectedValue if it exists, otherwise send
    //             }),
    //             signal: ctrl.signal,
    //             onmessage: (event) => {
    //                 if (event.data === '[DONE]') {
    //                     setMessageState((state) => ({
    //                         history: [...state.history, [question, state.pending ?? '']],
    //                         messages: [
    //                             ...state.messages,
    //                             {
    //                                 type: 'apiMessage',
    //                                 message: state.pending ?? '',
    //                                 sourceDocs: state.pendingSourceDocs,
    //                             },
    //                         ],
    //                         pending: undefined,
    //                         pendingSourceDocs: undefined,
    //                     }));
    //                     setLoading(false);
    //                     ctrl.abort();
    //                 } else {
    //                     const data = JSON.parse(event.data);
    //                     if (data.sourceDocs) {
    //                         setMessageState((state) => ({
    //                             ...state,
    //                             pendingSourceDocs: data.sourceDocs,
    //                         }));
    //                     } else {
    //                         setMessageState((state) => ({
    //                             ...state,
    //                             pending: (state.pending ?? '') + data.data,
    //                         }));
    //                     }
    //                 }
    //             },
    //         });
    //     } catch (error) {
    //         setLoading(false);
    //         // setError("An error occurred while fetching the data. Please try again.");
    //     }
    // }

    // const handleRegenerate = (e: any) => {
    //     setResponseReceived(false);
    //     setLoading(true);
    //     setQuery(previousUserText);
    //     handleRegenerateSubmit(e);
    // };

    // handle form submission
    async function handleSubmit(e: ClickOrPressEvent) {
        e.preventDefault();
        // setError(null);
        if (!query) {
            toast.error('Please input a question');
            setLoading(false);

            return;
        }

        // setPreviousUserText(query.trim());
        // setResponseReceived(true);
        const question = query.trim();

        setMessageState((state) => ({
            ...state,
            messages: [
                ...state.messages,
                {
                    type: 'userMessage',
                    message: question,
                },
            ],
            pending: undefined,
        }));

        setLoading(true);
        setQuery('');
        setMessageState((state) => ({ ...state, pending: '' }));

        const ctrl = new AbortController();

        try {
            fetchEventSource(`${APP_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    history,
                    // eslint-disable-next-line max-len
                    selectedValue: selectedValue || `UUF_${selectedPdf}`, // Send selectedValue if it exists, otherwise send
                }),
                signal: ctrl.signal,
                onmessage: (event) => {
                    if (event.data === '[DONE]') {
                        setMessageState((state) => ({
                            history: [...state.history, [question, state.pending ?? '']],
                            messages: [
                                ...state.messages,
                                {
                                    type: 'apiMessage',
                                    message: state.pending ?? '',
                                    sourceDocs: state.pendingSourceDocs,
                                },
                            ],
                            pending: undefined,
                            pendingSourceDocs: undefined,
                        }));
                        setLoading(false);
                        ctrl.abort();
                    } else {
                        const data = JSON.parse(event.data);
                        if (data.sourceDocs) {
                            setMessageState((state) => ({
                                ...state,
                                pendingSourceDocs: data.sourceDocs,
                            }));
                        } else {
                            setMessageState((state) => ({
                                ...state,
                                pending: (state.pending ?? '') + data.data,
                            }));
                        }
                    }
                },
            });
        } catch (error) {
            setLoading(false);
            // setError("An error occurred while fetching the data. Please try again.");
        }
    }

    // prevent empty submissions
    const handleEnter = useCallback(
        (e: ClickOrPressEvent) => {
            if (e.key === 'Enter' && query) {
                handleSubmit(e);
            } else if (e.key === 'Enter') {
                e.preventDefault();
            }
        },
        [query],
    );

    const chatMessages = useMemo(
        () => [
            ...messages,
            ...(pending
                ? [
                      {
                          type: 'apiMessage',
                          message: pending,
                          sourceDocs: pendingSourceDocs,
                      },
                  ]
                : []),
        ],
        [messages, pending, pendingSourceDocs],
    );

    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${APP_URL}/api/namespace`, {
                    method: 'GET',
                });
                if (res.status === 200) {
                    const options = await res.json();
                    if (type === '/customchat') {
                        setPdfOptions(options.otherFiles);
                    }
                } else {
                    // Handle error
                }
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOptions();
    }, []);

    // scroll to bottom of chat
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div
            className={
                hamburger ? cx(styles.mainContainer, styles.containerColor) : styles.mainContainer
            }
        >
            <UploadPDFModal isOpen={isModalOpen} onClose={closeModal} />
            <ToastContainer />

            {type === '/customchat' && (
                <div className={hamburger ? styles.leftContainerWrapper : styles.displayNone}>
                    <div className={hamburger ? styles.leftContainer : styles.displayNone}>
                        <div className='flex justify-between items-center mb-10'>
                            <div className={styles.headerImage}>
                                <Image
                                    src={MENU}
                                    alt='logo'
                                    width={22}
                                    height={16}
                                    onClick={() => setHamburger(!hamburger)}
                                />
                                {/* <Image src={PDFGPT_LOGO} alt='logo' width={78} height={20} /> */}
                                <h1
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        paddingLeft: '20px',
                                    }}
                                >
                                    Claire.ai
                                </h1>
                            </div>
                        </div>
                        <div className={styles.container}>
                            <div className={styles.dropdownStyle}>
                                <div className={styles.dropdownLabelStyle}>
                                    <Image
                                        src={DOCUMENT_UPLOAD1}
                                        alt='docuement-upload'
                                        width={20}
                                        height={20}
                                    />
                                    <p>Recent Upload</p>
                                </div>
                                <div className={styles.previousPdfUploadList}>
                                    {isLoading ? (
                                        <div className={styles.emptyStateMessage}>
                                            <ShimmerUiContainer
                                                className={styles.shimmerUi}
                                                variant='rectangular'
                                                animation='wave'
                                            />
                                        </div>
                                    ) : pdfOptions.length > 0 ? (
                                        pdfOptions.map((data, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.card} ${
                                                    selectedPdfCard === index
                                                        ? styles.selectedCard
                                                        : ''
                                                }`}
                                                onClick={() => handleClickPdf(index, data)}
                                                aria-hidden
                                            >
                                                {data}
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.emptyStateMessage}>
                                            <Image src={NO_RECORD} alt='noRecord' />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.chatContainer}>
                <div className={styles.chatScreenContainer}>
                    <div className={styles.chatHeaderContainer}>
                        <div className={styles.rightContainerHeading}>
                            <div className={styles.headerImage}>
                                {type === '/customchat' && (
                                    <Image
                                        src={MENU}
                                        alt='logo'
                                        width={22}
                                        height={16}
                                        onClick={() => setHamburger(!hamburger)}
                                    />
                                )}
                                {/* <Image src={PDFGPT_LOGO} alt='logo' width={78} height={20} /> */}
                                <h1
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Claire.ai
                                </h1>
                            </div>
                            {type === '/customchat' && (
                                <button
                                    onClick={openModal}
                                    className={styles.uploadButton}
                                    type='button'
                                >
                                    <Image
                                        src={DOCUMENT_UPLOAD}
                                        alt='document upload'
                                        width={20}
                                        height={20}
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className={styles.chatScreen}>
                        <div ref={messageListRef} className={styles.messageList}>
                            {chatMessages.map((message, index) => {
                                let icon;
                                let className;
                                if (message.type === 'apiMessage') {
                                    if (index === 0) {
                                        className = styles.firstMessage;
                                    } else {
                                        className = styles.apiMessage;
                                        icon = (
                                            <Image
                                                src={AI_AVATAR}
                                                alt='Me'
                                                className={styles.userIcon}
                                                priority
                                            />
                                        );
                                    }
                                } else {
                                    icon = (
                                        <Image
                                            src={USERICON_IMAGE}
                                            alt='Me'
                                            className={styles.userIcon}
                                            priority
                                        />
                                    );
                                    // The latest message sent by the user will be animated while waiting for a response
                                    className =
                                        loading && index === chatMessages.length - 1
                                            ? styles.userMessageWaiting
                                            : cx(styles.userMessage);
                                }
                                if (index !== 0 || chatMessages.length === 1) {
                                    return (
                                        <>
                                            <div key={`chatMessage-${index}`} className={className}>
                                                {icon}
                                                <div>
                                                    <div
                                                        className={
                                                            index === 0
                                                                ? ''
                                                                : index === 1 ||
                                                                  message.type === 'userMessage'
                                                                ? styles.userText
                                                                : styles.markDownAnswer
                                                        }
                                                    >
                                                        {message.type === 'apiMessage' &&
                                                        index !== 0 ? (
                                                            <Typing speed={20}>
                                                                {message.message}
                                                            </Typing>
                                                        ) : (
                                                            message.message
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* {message.sourceDocs && (
                        <div
                          className="p-5"
                          key={`sourceDocsAccordion-${index}`}
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b>
                                      {doc.metadata.source.split("/").pop()}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )} */}
                                        </>
                                    );
                                }

                                return null;
                            })}
                            {sourceDocs.length > 0 && (
                                <div className='p-5'>
                                    <Accordion type='single' collapsible className='flex-col'>
                                        {sourceDocs.map((doc, index) => (
                                            <div key={`SourceDocs-${index}`}>
                                                <AccordionItem value={`item-${index}`}>
                                                    <AccordionTrigger>
                                                        <h3>Source {index + 1}</h3>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <ReactMarkdown linkTarget='_blank'>
                                                            {doc.pageContent}
                                                        </ReactMarkdown>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </div>
                                        ))}
                                    </Accordion>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* {!loading && responseReceived && (
                        <button
                            type='button'
                            className={styles.regenrate}
                            onClick={handleRegenerate}
                        >
                            <Image src={REGENERATE} alt='Regen' width={14} height={14} />
                            Regenerate Response
                        </button>
                    )} */}
                </div>
                <div className={styles.bottomContainer}>
                    <div className={styles.textContainer}>
                        <div className={styles.center}>
                            <div className={styles.cloudForm}>
                                <form>
                                    <textarea
                                        onKeyDown={handleEnter}
                                        ref={textAreaRef}
                                        rows={1}
                                        maxLength={512}
                                        id='userInput'
                                        name='userInput'
                                        placeholder={
                                            loading ? 'Waiting for response...' : 'Send a Message'
                                        }
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className={styles.textarea}
                                        disabled={loading || hamburger}
                                    />
                                </form>
                            </div>
                        </div>
                        <button
                            type='submit'
                            disabled={loading || hamburger}
                            className={styles.generateButton}
                        >
                            <div className={styles.submitButton} onClick={handleSubmit} aria-hidden>
                                {loading ? (
                                    <div className={styles.dots}>
                                        <LoadingDots color='#FFF' style='small' />
                                    </div>
                                ) : (
                                    <>
                                        <Image
                                            src={SUBMIT_ICON}
                                            alt='submit-icon'
                                            width={16}
                                            height={16}
                                        />
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                    <p className={styles.copyright}>
                        © 2024 Primathon Claire.ai. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileChat;
