export function sort<T extends unknown[]>(array: T, sortCol: string): T {
    return <T> (array as any[]).sort((a, b) => {
        if (a[sortCol] < b[sortCol])
            return -1;
        else if (a[sortCol] > b[sortCol])
            return 1;

        return 0;
    })
}

export function errorMsgParse(err: any) {
    const message = 'response' in err ? 'data' in err.response ? typeof err.response.data === 'object' && 'errMsg' in err.response.data ? err.response.data.errMsg : err.response.data : err.message : err.message;

    return message;
}