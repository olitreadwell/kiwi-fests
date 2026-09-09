/**
 * Search form posted to the server-side fuzzy search page.
 *
 * @param defaultValue - Initial query value
 * @returns Form element
 */
export function SearchBox({ defaultValue = '' }: { defaultValue?: string }): React.ReactElement {
  return (
    <form action="/search" method="get" role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor="search-input" className="sr-only">
        Search listings
      </label>
      <input
        id="search-input"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search by name, category, suburb…"
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
