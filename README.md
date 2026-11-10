# libretta.app

Web estática de Libretta, servida con GitHub Pages en https://libretta.app, en los 34 idiomas de FitWoody en el App Store.

- `/` y `/privacy/` en inglés; el resto en `/<idioma>/` y `/<idioma>/privacy/`. `/es/privacidad/` redirige a `/es/privacy/`.
- Las páginas inglesas llevan al idioma del navegador; el selector del pie guarda la elección.
- Los textos viven en `i18n/<idioma>.json` y `en.json` es la referencia. Tras cambiar un texto: `python3 tools/build.py`, y se commitean los HTML generados.

Sin dependencias: HTML, una hoja de estilos e Instrument Sans autoalojada (latin y latin-ext; los demás alfabetos usan la fuente del sistema).
