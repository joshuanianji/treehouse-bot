
/**
 * Pagination helper for supabase
 * Source: https://github.com/supabase/supabase/discussions/1223#discussioncomment-1601400
 * 
 * @param page the page number to retrieve
 * @param size The size of every page  
 * @returns {from: number, to: number} that represents the range of what you want to get
 */
export const getPagination = (page: number, size: number) => {
    const limit = size ? +size : 3
    const from = page ? page * limit : 0
    const to = page ? from + size - 1 : size - 1

    return { from, to }
}