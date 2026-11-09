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
        className="w-full rounded-full border border-ink-muted bg-white px-5 py-3"
      />
      <button
        type="submit"
        className="rounded-full bg-brand px-6 py-3 font-medium text-on-brand transition-colors hover:bg-brand-strong"
      >
        Search
      </button>
    </form>
  )
}
