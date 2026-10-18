import { MAX_QUERY_LENGTH } from '@/lib/search'

/** A plain GET form: works without JavaScript. */
export function SearchForm({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/search/" method="get" role="search" className="flex max-w-xl gap-2">
      <label htmlFor="search-query" className="sr-only">
        Search the site
      </label>
      <input
        id="search-query"
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={MAX_QUERY_LENGTH}
        placeholder="Search"
        className="w-full rounded-md border border-border bg-surface px-3 py-2"
      />
      <button
        type="submit"
        className="rounded-md bg-brand px-5 py-2 font-semibold text-on-brand hover:bg-brand-strong"
      >
        Search
      </button>
    </form>
  )
}
