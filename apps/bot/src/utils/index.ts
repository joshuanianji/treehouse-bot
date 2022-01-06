// all other utility functions I don't wanna put in their own files

export const truncate = (str: string, n: number): { truncated: boolean, str: string } => ({
    truncated: str.length > n,
    str: str.length > n ? str.substring(0, n - 1) + '...' : str
})