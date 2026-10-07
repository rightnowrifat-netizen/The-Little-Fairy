# Minha · The Little Fairy ✨

A romantic, cinematic personal website for Samiya Zannat Minha, created by Redwan Rifat.

Plain HTML, CSS and JavaScript. No images, no build step, no backend.

## Files

```
index.html   page structure and content
style.css    design, glassmorphism, animations
script.js    scroll reveal, particles, cursor, music, love score, final surprise
audio/       optional: put favorite-song.mp3 here
```

## Deploy

**GitHub Pages:** push these files to a repository, then Settings → Pages → Deploy from branch → `main` / root. Your site appears at `https://<username>.github.io/<repo>/`.

**Netlify / Vercel:** drag the folder in, or connect the repo. Leave build command and output directory empty.

## Optional background music

Add your own file named `audio/favorite-song.mp3`. The floating button (bottom right) starts it on click; it never autoplays.
If the file is missing, the button simply stays quiet and nothing breaks.

Git does not track empty folders. If you want the `audio/` folder in your repo before adding a song, add an empty `audio/.gitkeep` file.

## Songs

The two song cards link to YouTube and open in the same tab. No audio is hosted here.

## Notes

- Fonts load from Google Fonts. If offline, elegant system serif and sans fonts are used instead.
- Respects "reduce motion" settings and hides the custom cursor on touch devices.
- To change any text, edit `index.html`. The final letter lives in `script.js` (the `msg` variable).
