# libretta.app

Web de Libretta, hecha con [Astro](https://astro.build) y servida con GitHub Pages en https://libretta.app, en los 34 idiomas de FitWoody en el App Store. Cada push a `main` la compila y la publica con `.github/workflows/deploy.yml`.

## Trabajar en local

```sh
npm install
npm run dev       # http://localhost:4321, con los borradores del blog
npm run build     # la web publicada, en dist/
```

## Dónde vive cada cosa

- `src/i18n/<idioma>.json`: los textos de cada idioma. `en.json` es la referencia y la compilación falla si a otro idioma le falta una clave.
- `src/pages/[...lang]/`: las páginas. El inglés vive en `/` y el resto en `/<idioma>/`: `/`, `/privacy/`, `/blog/` y `/blog/<slug>/`.
- `src/content/blog/<idioma>/<slug>.md`: los artículos. El nombre del fichero es el slug, en el idioma del artículo, y `key` une las traducciones de un mismo artículo.
- `public/`: lo que se sirve tal cual (`assets/`, `CNAME`, y `/es/privacidad/`, que redirige a `/es/privacy/`).
- `tools/compare.py`: compara dos compilaciones (direcciones, etiquetas SEO y texto de cada página).
- `tools/og.mjs`: las imágenes para redes de cada idioma, `public/assets/og/<idioma>.png`, con la entradilla de su JSON (`node tools/og.mjs`, necesita Playwright).
- `src/lib/analytics.ts`: el contenedor de Google Tag Manager. Solo se carga si el visitante acepta el aviso de cookies; el enlace Cookies del pie vuelve a abrirlo.
- `src/lib/store.ts`: el número de la ficha del App Store. Al rellenarlo salen el banner de Safari y el enlace en los datos estructurados.

## Escribir un artículo

```markdown
---
key: grabar-reuniones          # igual en todas sus traducciones
title: Graba una reunión sin perderte la conversación
description: Una o dos frases para Google y las redes.
date: 2026-11-23
updated: 2026-12-01            # opcional
image: ./portada.jpg           # opcional, imagen para redes y datos estructurados
imageAlt: Descripción de la imagen
draft: true                    # se ve en `npm run dev`, nunca se publica
---
```

El blog de un idioma, su RSS (`/<idioma>/blog/rss.xml`) y su enlace en el pie aparecen solo cuando ese idioma tiene algún artículo publicado.

## SEO

Cada página lleva canonical, el título de la portada alineado con el nombre de la ficha (`home_title`), imagen para redes en su idioma, hreflang recíproco con x-default (en un artículo, solo hacia las traducciones que existen), título, descripción y Open Graph propios, y datos estructurados (Organization, WebSite y SoftwareApplication en la portada; Blog, BlogPosting y BreadcrumbList en el blog). `sitemap.xml` incluye las alternativas de idioma y `robots.txt` lo anuncia. No hay redirección automática por idioma: si el navegador pide otro idioma en el que existe la página, se ofrece con un aviso abajo, y la elección se guarda.
