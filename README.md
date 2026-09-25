# Gastos

App web minimalista para registrar gastos diarios, semanales y mensuales. Sin backend ni base de datos: todo se guarda en el `localStorage` del navegador.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Recharts

## Uso

```bash
npm install
npm run dev     # servidor de desarrollo
npm run build   # build estático en dist/
```

El build de `dist/` es estático y se puede publicar en Vercel, Netlify o GitHub Pages.

## Funcionalidad

- Registro de gastos con monto, categoría, fecha y nota.
- Vistas diario / semanal / mensual con navegación entre periodos.
- Total del periodo y desglose por categoría con gráfico.
- Exportar a JSON o CSV e importar desde JSON para respaldo.

Los datos viven solo en el navegador; al limpiar los datos del sitio se pierden, por lo que conviene exportar de vez en cuando.
