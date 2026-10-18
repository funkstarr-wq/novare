import { LivePreviewListener } from './LivePreviewListener'

/** Shown only in draft mode (live preview): says so and offers a way out. */
export function PreviewBanner() {
  return (
    <>
      {/* A form, not a link: leaving preview is a request to a route handler. */}
      <form
        action="/api/preview/exit/"
        method="get"
        role="status"
        className="flex items-center justify-center gap-3 bg-ink px-6 py-2 text-sm text-white"
      >
        You are viewing a draft preview.
        <button type="submit" className="underline">
          Exit preview
        </button>
      </form>
      <LivePreviewListener serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ''} />
    </>
  )
}
