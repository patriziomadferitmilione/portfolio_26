# Project Status

## Completed

- Initialized the frontend repository and pushed it to GitHub.
- Set up Vue 3 with Vite, Pinia, and PrimeVue.
- Configured the Vite dev server to run on port 5193.
- Built the split portfolio shell with `Software` and `Music` modes.
- Added a local player store with queue selection, playback controls, volume, and local file import.
- Added dark and light themes based on the shared color palette.
- Shifted the layout toward a mobile-first baseline.
- Added a frontend API layer for the local/backend environment.
- Connected public tracks and releases to the backend API.
- Connected playback to the backend authorization endpoint.
- Added session-auth hydration and login/logout support in the frontend.
- Added an initial admin UI for track CRUD and release CRUD.
- Added initial media upload handling in the admin UI and connected it to backend media endpoints.
- Added a persistent bottom mini-player with an expandable full-player sheet.

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

- Refine the admin UI into dedicated views instead of one combined page
- Add release detail presentation and richer artwork handling
- Add form validation and stronger loading/error states for all admin actions
- Add inline asset previews and media filters in the admin UI
- Decide whether to add artwork/image caching and later offline handling for public media
- Introduce routing for public music pages and protected admin pages

## Notes

- Frontend repo: `portfolio_26`
- Dev server port: `5193`
- Frontend API env: `VITE_API_BASE_URL`
- Initial backend repo is separate and will own playback authorization, uploads, auth, and media access rules
