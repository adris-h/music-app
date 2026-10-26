// The original imported "SearchResult" but used "SearchResponse".
// Make sure this name matches what your types/models.ts really exports.
import type { SearchResponse } from '~/types/models'

export const useSearch = (query: MaybeRefOrGetter<string>, key = 'search')  => {
    // The search text without spaces at the start and end.
    // computed() updates itself whenever the query changes.
    const cleanQuery = computed(() => toValue(query).trim())

    // What to show before any search, or when the box is empty
    const emptyResult = { albums: [], artists: [] }

    // The function that does the work
    async function runSearch() {
        // Empty box? Skip the backend call.
        if (!cleanQuery.value) {
            return emptyResult
        }

        return await $fetch<SearchResponse>('/api/search', {
            query: { q: cleanQuery.value },
        })
    }

    return useAsyncData<SearchResponse>(key, runSearch, {
        watch: [cleanQuery],
        default: () => emptyResult,
    })
}