export const trimText = (text: string, limit: number  ): string => {
    if (limit == null) limit = 12;
    return text.length > limit ? `${text.slice(0, limit)}...` : text
}