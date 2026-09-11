# Campify — Prompt de continuación

Tengo una app web llamada **Campify** (archivo `campify.html`, ~1900 líneas).
Es un editor de lead sheets / cifrado americano para iPad con Apple Pencil.
Adjunto el archivo HTML completo. Continuá el desarrollo sin romper lo que ya funciona.

-----

## Identidad

- **Nombre:** Campify · Tagline: *Write. Recognize. Play.*
- **Paleta:** UI oscura `#12141A` + papel blanco `#FAFAF7` + dorado `#C9A84C`/`#E8D08A`
- **Logo SVG:** cuadrado redondeado, pentagrama, acordes Am7 D7 G∆, C cursiva, Apple Pencil diagonal
- **Plataforma:** iPad Safari + Apple Pencil, también funciona en desktop

-----

## Arquitectura — NO cambiar

**Una sola barra** de 52px (no múltiples barras).

**Ghost textarea por slot:**
Cada beat tiene un `<textarea class="bgh">` invisible (opacity:0) encima.
El Apple Pencil escribe directamente ahí via iOS HWR.
El acorde aparece tipografiado en tiempo real en el `<div id="bd-{slotId}">` debajo.

- Tap simple → enfoca el textarea del slot
- Long press 600ms → abre editor flotante `#ce`
- Enter → salta al siguiente compás
- Swipe down → cierra editor flotante

**Layout de compases:**

- 1 compás = 1 fila completa
- 4/4 muestra 4 beat slots en horizontal dentro del compás
- Sin líneas divisorias entre beats (solo barras de compás)
- Tiempo (4/4) como overlay absoluto — NO empuja las celdas
- Número de compás arriba-izquierda de cada celda (pequeño, gris)

**Render:** siempre re-render completo de `#pl` innerHTML + `attachG()` en cada ghost textarea.

-----

## Motor de acordes — NO cambiar

**Normalización en tiempo real** (función `normI()`):

- `△ ▲ Δ` → `∆`, `º` → `°`, `tt ##` → `#`, `♯` → `#`, `♭` → `b`
- Primera letra siempre mayúscula (root), nota de bajo tras `/` siempre mayúscula

**Parser** `pC(raw)` reconoce:
`m m7 m9 ∆ ∆7 maj7 M7 ° °7 dim dim7 ø ø7 hdim sus sus4 sus2 + aug add9 N.C. % § ⊕`

**Tipografía de acordes** (Helvetica Neue 900, condensed):

- Root: tamaño completo
- Alteración ♯♭: 58% superíndice
- Calidad (m sus +): 44% subíndice
- Número (7 9 11): 44% subíndice
- ∆ °  ø: 54-58% superíndice

-----

## Modelo de datos (localStorage: `campify_v1`)

```js
Song { id, title, artist, key, bpm, time, style, sections[] }
Section { id, letter, name, rows[], repeat, subdiv }
Row { id, measures[] }          // normalmente 1 measure por row
Measure { id, slots[], flags }  // flags: repOpen repClose final
Slot { id, raw, lyric }
```

-----

## Features ya implementadas

- ✅ Ghost textarea con Pencil HWR nativo
- ✅ Tipografía en tiempo real de acordes
- ✅ Normalización automática (△→∆, º→°, tt→#)
- ✅ Tira de símbolos horizontal (aparece al editar)
- ✅ Secciones con color tint (A=azul B=rojo C=púrpura D=verde E=naranja)
- ✅ Badge editable inline, nombre editable inline
- ✅ Repetición (×2 ×3) bottom-right de la última fila
- ✅ Números de compás siempre visibles
- ✅ Enter → siguiente compás automático
- ✅ Undo 30 niveles + ⌘Z
- ✅ Modo Gig fullscreen (todos los beats visibles, sin controles)
- ✅ 12 plantillas de progresión
- ✅ Detectar tonalidad (Krumhansl-Schmuckler)
- ✅ Diagramas de guitarra (canvas)
- ✅ Compartir / QR (song comprimida en URL)
- ✅ Transponer ±12 semitonos
- ✅ Capo calculator con barra activa
- ✅ Multi-select compases (copiar / pegar / vaciar)
- ✅ Botón ↑ copiar compás anterior
- ✅ Exportar PDF, HTML standalone, texto
- ✅ Tap tempo (BPM por toque)

-----

## Comportamientos críticos de UX

- Tap simple en compás → abre teclado directamente (NO long press)
- Los chips de símbolos insertan EN EL CURSOR, no al final
- Al agregar sección → scroll a esa sección, no al final de la hoja
- Símbolo desconocido → resaltado en ámbar + sugerencias similares
- El tiempo 4/4 es un overlay absoluto que NO desalinea las celdas
- El editor flotante `#ce` se posiciona debajo del compás, se voltea si está cerca del borde

-----

## Stack técnico

- HTML/CSS/JS puro, sin frameworks
- Sin dependencias externas (todo inline excepto Google Fonts)
- `localStorage` para persistencia
- SVG inline para el logo
- Canvas para diagramas de guitarra

-----

## Pendiente / próximas features sugeridas

**Alta prioridad:**

- [ ] **Importar desde texto** (67): pegar “Am F C G | Em Dm” → parsear y crear chart
- [ ] **Reproductor con Tone.js**: piano + bajo sintéticos, 4 estilos (Ballad/Jazz/Bossa/Rock), compás activo resaltado
- [ ] **Set list**: agrupar canciones, swipe entre ellas en Gig mode
- [ ] **Autoscroll en Gig** sincronizado con BPM

**Media prioridad:**

- [ ] **Foto → Chart**: usar Claude Vision API para transcribir charts fotografiados
- [ ] **Notas por sección**: texto privado visible solo en edición
- [ ] **Exportar a iReal Pro**: generar URL `irealbook://`
- [ ] **Historial de acordes usados**: chips con últimos 6 acordes de la canción

-----

## Instrucciones para agregar features

1. Adjuntá el archivo `campify.html` actual
1. Especificá qué feature agregar
1. Nunca cambiar: el modelo de datos, `normI()`, `pC()`, `attachG()`, el logo SVG
1. Siempre: re-testear que los ghost textareas siguen funcionando después del cambio
1. El archivo resultante debe ser un único HTML standalone funcional