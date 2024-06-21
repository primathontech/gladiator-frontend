export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export const UPLOAD_API_URL = `${APP_URL}/api/upload`;

export enum AppRoutes {
    HOME = '/',
    CHAT = '/chat',
    CUSTOM_CHAT="/customchat"
}

export enum ApiRoute {
    CHAT_API = '/api/chat',
    UPLOAD_FILE_LIST = '/api/namespace',
}

export const LinkedInAuthUrl = 'https://www.linkedin.com/oauth/v2/authorization';
