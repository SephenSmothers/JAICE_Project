import { api } from "./api";

export interface GmailMessage 
{
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    payload: {
        headers: Array<{name: string; value: string;}>;
        body?: {data?: string };
        parts?: Array<{
            mimeType: string;
            body: {data?: string};
        }>;
    };
    internalDate: string;
}

export interface GmailListResponse
{
    messages: Array<{id: string; threadId: string;}>;
    nextPageToken?: string;
    resultSizeEstimate: number;
}

function createMockEmails(): GmailMessage[] {
    return [
        {
            id: "mock-1",
            threadId: "thread-1",
            labelIds: ["INBOX"],
            snippet: "Thank you for your application to our Software Engineer position...",
            payload: {
                headers: [
                    { name: "Subject", value: "Application Confirmation - Software Engineer" },
                    { name: "From", value: "hr@techcompany.com" },
                    { name: "Date", value: "Mon, 14 Oct 2024 10:30:00 -0700" }
                ]
            },
            internalDate: "1729799400000" // Oct 24, 2024
        },
        {
            id: "mock-2",
            threadId: "thread-2",
            labelIds: ["INBOX"],
            snippet: "We would like to schedule an interview with you...",
            payload: {
                headers: [
                    { name: "Subject", value: "Interview Invitation - Frontend Developer" },
                    { name: "From", value: "recruiter@startup.io" },
                    { name: "Date", value: "Sun, 13 Oct 2024 14:15:00 -0700" }
                ]
            },
            internalDate: "1729713300000" // Oct 23, 2024
        },
        {
            id: "mock-3",
            threadId: "thread-3",
            labelIds: ["INBOX"],
            snippet: "Congratulations! We are pleased to offer you the position...",
            payload: {
                headers: [
                    { name: "Subject", value: "Job Offer - Full Stack Developer" },
                    { name: "From", value: "ceo@innovatetech.com" },
                    { name: "Date", value: "Sat, 12 Oct 2024 16:45:00 -0700" }
                ]
            },
            internalDate: "1729635900000" // Oct 22, 2024
        }
    ];
}

// get last 10 emails
export async function getLastEmails(maxResults: number = 10): Promise<GmailMessage[]>
{
    try 
    {
        console.log("Fetching last emails from Gmail...");

        // first get the list of message ids
        const listResponse: GmailListResponse = await api(`/gmail/messages?maxResults=${maxResults}`);

        console.log('list response:', listResponse);

        if (!listResponse.messages || listResponse.messages.length === 0) 
        {
            console.log('No messages found, returning mock emails.');
            return createMockEmails();
        }

        // then fetch full details for each message
        const messagePromises = listResponse.messages.map((msg) =>
            api(`/gmail/messages/${msg.id}`)
        );

        const messages: GmailMessage[] = await Promise.all(messagePromises);
        console.log('successfully fetched messages:', messages);
        return messages;

    } 
    catch (error) 
    {
        console.error('Error fetching emails:', error);
        return createMockEmails(); // return mock emails on error
    }
}

// helper function to extract subject from the email headers
export function getEmailSubject(message: GmailMessage): string
{
    const subjectHeader = message.payload.headers.find(
        header => header.name.toLowerCase() === 'subject'
    );
    return subjectHeader?.value || '(No Subject)';
}

// helper function to format email date
export function formatEmailDate(internalDate: string): string
{
    const date = new Date(parseInt(internalDate));
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// convert messages to jobcard format
export function convertEmailsToJobCards(messages: GmailMessage[]): Array<{
    id: string;
    title: string;
    column: string;
    date: string;
}> {
    const jobCards = messages.map(message => ({
        id: message.id,
        title: getEmailSubject(message),
        column: 'applied', // default column
        date: formatEmailDate(message.internalDate),
    }));
    console.log('Converted job cards:', jobCards);
    return jobCards;
}