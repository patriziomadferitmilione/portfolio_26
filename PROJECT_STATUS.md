# Project Status

## Completed

- Initialized the frontend repository and pushed it to GitHub.
- Set up Vue 3 with Vite, Pinia, and PrimeVue.
- Configured the Vite dev server to run on port 5193.
- Built the split portfolio shell with `Software` and `Music` modes.
- Added a local player store with queue selection, playback controls, volume, and local file import.
- Added dark and light themes based on the shared color palette.
- Shifted the layout toward a mobile-first baseline.

## Current Frontend Shape

- Framework: Vue 3
- Build tool: Vite
- State: Pinia
- UI library: PrimeVue
- Main feature in progress: music-side product design

## Public Music Sections

- `Home`
  - Featured track or release
  - Short artist statement
  - Immediate playback entry point
  - Links to streaming platforms
- `Releases`
  - Singles, EPs, albums, demos
  - Artwork, credits, release notes, lyrics links
- `Tracks`
  - Song library view
  - Filter by mood, era, release, version
- `About`
  - Biography, background, instruments, artistic direction
- `Live`
  - Past shows, notable venues, future dates
- `Writing`
  - Lyrics, track notes, story fragments, creative process
- `Contact / Support`
  - Contact links, mailing list, support entry points

## Admin / Creator Operations

- `Dashboard`
  - View draft content, published content, recent uploads, and activity
- `Track Manager`
  - Create track
  - Edit metadata
  - Upload audio
  - Assign artwork
  - Set visibility
  - Attach lyrics and credits
- `Release Manager`
  - Create release
  - Edit release details
  - Reorder tracklist
  - Publish or unpublish release
- `Media Library`
  - Upload and manage artwork, photos, banners, and visuals
- `Live Manager`
  - Add, edit, archive shows and venue details
- `Writing Manager`
  - Create and edit lyrics, notes, and stories
- `Site Content`
  - Edit homepage hero, featured sections, about text, contact info, and platform links
- `Users`
  - Support at least `admin`, later `editor` and `listener`
- `Access Control`
  - Manage private tracks, previews, and user-gated sections

## Frontend Implementation Phases

- `Phase 1`
  - Finalize mobile-first public music homepage
  - Split current music mode into reusable sections/components
  - Add route structure for public pages
- `Phase 2`
  - Connect track and release views to backend data
  - Replace local-only playback data with API-driven catalog data
  - Request signed playback URLs before play
- `Phase 3`
  - Add authentication UI
  - Build admin dashboard shell
  - Add track and release management screens
- `Phase 4`
  - Add user-aware features like private listening, favorites, and gated content

## Immediate Next Steps

- Refine the music-side homepage mobile UI
- Define the final public music sitemap
- Add Vue routing for public sections and future admin sections
- Connect frontend player state to backend catalog and playback authorization
- Start the admin shell with protected routes and layout

## Notes

- Frontend repo: `portfolio_26`
- Dev server port: `5193`
- Initial backend repo is separate and will own playback authorization, uploads, auth, and media access rules
