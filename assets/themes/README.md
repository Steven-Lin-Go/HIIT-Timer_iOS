# Theme backdrop photos

Optional bitmap artwork for the four UI styles. Each theme falls back to the
vector motif in `src/components/ThemeMotif.tsx` when no photo is present, so
this folder can stay empty.

## Adding one

1. Drop the file in here using the theme's key as the name:

   - `fitness.jpg`
   - `bohemia.jpg`
   - `zen.jpg`
   - `ikea.jpg`

2. Uncomment the matching line in `THEME_PHOTOS` in
   [`src/theme/backdrops.ts`](../../src/theme/backdrops.ts). Metro only resolves
   static `require` literals, so a file that is not referenced there is ignored.

## Composition

- 1290 × 2796 (iPhone Pro Max) JPEG, portrait.
- Keep the middle third quiet — the ring and countdown digits sit there.
- Detail reads best low in the frame, matching the mockups in `photo/`.

A scrim in the theme's base color is always painted over the photo
(`THEME_PHOTO_SCRIM`), so images do not need to be pre-dimmed.
