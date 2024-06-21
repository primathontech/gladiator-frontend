export const getURLWithQueryParams = (base: any, params: any) => {
    const query = Object.entries(params)
        .map(([key, value]: any) => `${key}=${encodeURIComponent(value)}`)

        .join('&');

    return `${base}?${query}`;
};
