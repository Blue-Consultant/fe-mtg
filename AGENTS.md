# Convertir Guía React

## Objetivo 
El objetivo es convertir la guía existente (actualmente en HTML) a React, reemplazando su implementación dentro del archivo de destino.

La nueva versión debe integrarse de forma coherente con el resto del aplicativo, respetando patrones, estilos y comportamientos ya existentes para asegurar consistencia.

Durante la conversión se deben aplicar buenas prácticas de desarrollo frontend, siguiendo principios como KISS, SOLID y separación de responsabilidades, priorizando claridad, reutilización y mantenibilidad.

### Migración 1

Guía origen:
src/guides/login.html

Archivo objetivo:
src/app/[lang]/(menu)/(private)/login-mtg/page.jsx

Componentes base a utilizar:
src/views/login-mtg

### Migración 2

Guía origen:
src/guides/register.html

Archivo objetivo:
src/app/[lang]/(menu)/(private)/register-mtg/page.jsx

Componentes base a utilizar:
src/views/register-mtg

### Migración 3

Guía origen:
src/guides/profile.html

Archivo objetivo:
src/app/[lang]/(menu)/(private)/profile/page.jsx

Componentes base a utilizar:
src/views/profile

### Migración 4

Guía origen:
src/guides/recovery-password.html

Archivo objetivo:
src/app/[lang]/(menu)/(private)/recovery-password/page.jsx

Componentes base a utilizar:
src/views/recovery-password

### Migración 5

Guía origen:
src/guides/payment-success.html

Archivo objetivo:
src/app/[lang]/(menu)/(private)/payment-success/page.jsx

Componentes base a utilizar:
src/views/payment-success

## PRINCIPIOS DE DISEÑO

- KISS – Simple antes que complejo
- DRY – No repetir lógica
- SOLID (adaptado a frontend)
- Separation of Concerns
- Composition over inheritance

## Accesibilidad (UX inclusivo)

- Buen contraste de colores
- Textos legibles
- No depender solo del color para comunicar
- Elementos clicables claros
- Pensar en usuarios reales, no ideales

## Lenguaje UX (microcopy)

- Lenguaje humano, cercano y simple
- Evitar tecnicismos
- Mensajes positivos y orientados a solución
