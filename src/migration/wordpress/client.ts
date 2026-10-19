/**
 * Read-only client for the old site's WordPress REST API (brief §11). Paginates, retries once on
 * a network error, and never sends credentials: everything it reads is public.
 */
export type Fetcher = typeof fetch

export type WpRendered = { rendered: string }
export type WpPost = {
  id: number
  slug: string
  date: string
  link: string
  title: WpRendered
  excerpt: WpRendered
  content: WpRendered
  categories?: number[]
  featured_media?: number
  parent?: number
}
export type WpMedia = {
  id: number
  slug: string
  date: string
  source_url: string
  mime_type: string
  alt_text?: string
  title: WpRendered
}
export type WpCategory = { id: number; slug: string; name: string }

export class WordPressClient {
  constructor(
    readonly base = 'https://novare.com',
    private fetcher: Fetcher = fetch,
  ) {}

  private async request(url: string, attempt = 0): Promise<Response> {
    try {
      const response = await this.fetcher(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'novare-rebuild-import' },
        signal: AbortSignal.timeout(60_000),
      })
      if (!response.ok) throw new Error(`${url} answered ${response.status}`)
      return response
    } catch (error) {
      if (attempt < 1) return this.request(url, attempt + 1)
      throw error
    }
  }

  /** Every item of a REST collection, following `X-WP-TotalPages`. */
  async all<T>(type: string, params: Record<string, string> = {}): Promise<T[]> {
    const items: T[] = []
    for (let page = 1; ; page += 1) {
      const query = new URLSearchParams({ per_page: '100', page: String(page), ...params })
      const response = await this.request(`${this.base}/wp-json/wp/v2/${type}?${query}`)
      items.push(...((await response.json()) as T[]))
      const pages = Number(response.headers.get('x-wp-totalpages') ?? '1')
      if (page >= pages) return items
    }
  }

  async one<T>(type: string, id: number): Promise<T | null> {
    try {
      return (await (await this.request(`${this.base}/wp-json/wp/v2/${type}/${id}`)).json()) as T
    } catch {
      return null
    }
  }

  /** A file from the site, as bytes. Only files on the site itself are fetched. */
  async file(url: string): Promise<{ data: Buffer; mimetype: string }> {
    const target = new URL(url, this.base)
    if (target.origin !== new URL(this.base).origin) throw new Error(`Not on the old site: ${url}`)
    const response = await this.request(target.toString())
    return {
      data: Buffer.from(await response.arrayBuffer()),
      mimetype: response.headers.get('content-type')?.split(';')[0] ?? 'application/octet-stream',
    }
  }
}
