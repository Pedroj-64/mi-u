# Mi U

Panel personal para organizar la vida universitaria en un solo lugar: entregas, clases virtuales, aulas de Moodle, Google Classroom y Google Drive.

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)

## Funciones

- **Entregas:** registra tareas con materia, descripción y fecha límite. Se ordenan por urgencia y muestran cuánto falta.
- **Avisos:** notificación del navegador cuando falta menos de 24 horas para una entrega (requiere permiso).
- **Clases virtuales:** guarda el enlace de Meet, Zoom o Teams de cada materia y ábrelo con un clic.
- **Aula virtual (Moodle):** enlace al aula de cada materia.
- **Classroom:** acceso a Google Classroom y enlace por materia.
- **Drive:** acceso rápido a Google Drive y a carpetas o enlaces que uses seguido.
- **Materias:** agrega, quita y reordena materias (arrastrándolas o con las flechas); aparecen en todas las secciones.
- **Respaldo:** exporta e importa tus datos en JSON; borrar o importar se puede deshacer.
- **Atajos de teclado:** `/` busca entregas y `n` empieza una entrega nueva.

Los datos se guardan en el `localStorage` del navegador. No hay servidor ni cuentas.

## Versión actual

La versión inicial es un único archivo HTML sin dependencias:

```
mi-u.html   # aplicación completa (HTML, CSS y JavaScript)
```

Para usarla, abre `mi-u.html` en cualquier navegador moderno.

## Privacidad

- Todos los datos viven en tu navegador. Nada se envía a servidores externos.
- Si cambias de navegador o de equipo, los datos no se transfieren automáticamente.
- Antes de limpiar datos del navegador, conviene exportar un respaldo (cuando esté disponible la función de exportar).

## Hoja de ruta

- [x] Reestructurar el proyecto con Vite + React + TypeScript
- [x] Rediseño visual con modo claro y oscuro
- [x] Vista semanal de entregas
- [x] Filtros y búsqueda
- [x] Ordenar materias arrastrándolas
- [x] Exportar e importar datos en JSON
- [x] Deshacer al borrar
- [x] Pruebas unitarias para la lógica de fechas y estados
- [x] Atajos de teclado

## Pendientes

- [ ] Migrar a Node 24 LTS. Node 25 ya no tiene soporte y Vitest 5 no lo admite; por eso Vitest sigue en 4.1.

## Cómo contribuir o probar cambios

1. Clona el repositorio.
2. Abre `mi-u.html` en el navegador y recarga después de cada cambio.
3. Cuando se migre al stack nuevo, este apartado se actualizará con los comandos de instalación y ejecución.

## Licencia

Distribuido bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE).
