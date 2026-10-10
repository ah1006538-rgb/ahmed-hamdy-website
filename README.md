# AHMED HAMDY® — Personal Brand Website

Static, bilingual (English / Arabic) website for Ahmed Hamdy — Performance Media Buyer & Marketing Strategist.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `work.html` | Client work and brand logos |
| `services.html` | Services |
| `story.html` | Story |
| `contact.html` | Contact |

## Structure

- `styles.css` — shared styles for all pages
- `app.js` — language switching (EN / AR with RTL support) and shared behavior
- `logos/` — client logos, grouped by market (`egypt`, `uae`, `ksa`)
- `media/results/` — campaign result screenshots and videos
- `og.png` — social sharing image

## Bilingual content

Translatable elements carry both languages as attributes:

```html
<h1 data-en="English text" data-ar="النص العربي">English text</h1>
```

`app.js` swaps the text and sets `lang` / `dir` on `<html>`. The language is picked from the `?lang=ar|en` URL parameter, then from `localStorage`, and defaults to English.

## Running locally

There is no build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
