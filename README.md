# Cafetería Escolar – Pedidos en línea (PWA)

Aplicación web de caso práctico para el **Portafolio de Evidencias**: publicación de una aplicación web.

Los alumnos consultan el menú, arman su pedido, eligen la hora de entrega y reciben un folio. La app se puede instalar en el celular o la computadora y funciona sin conexión.

## Estructura

```
cafeteria-escolar/
├── index.html            Página principal
├── pruebas.html          Pruebas de funcionamiento automáticas
├── 404.html              Página de error
├── manifest.json         Manifiesto de la PWA
├── sw.js                 Service Worker (caché sin conexión)
├── css/styles.css        Estilos (diseño responsivo)
├── js/app.js             Interfaz y eventos
├── js/carrito.js         Lógica del carrito y validaciones
├── js/datos-respaldo.js  Menú de respaldo
├── data/menu.json        Menú (datos en JSON)
└── img/                  Íconos de la app (192 y 512 px)
```

## Probar en tu computadora

Una opción es **abrir `index.html` con doble clic**. Así funciona el menú y el carrito, pero **no** el modo sin conexión ni algunas pruebas, porque se necesita un servidor.

Lo recomendado es usar un servidor local. Cualquiera de estas opciones sirve:

1. **VS Code + Live Server**: abre la carpeta, clic derecho en `index.html` → *Open with Live Server*.
2. **Python**: dentro de la carpeta ejecuta `python -m http.server 8000` y abre <http://localhost:8000>.
3. **Node.js**: `npx serve .`
4. **XAMPP**: copia la carpeta a `C:\xampp\htdocs\` y abre <http://localhost/cafeteria-escolar/>.

Después abre <http://localhost:8000/pruebas.html> para correr las pruebas de funcionamiento. Deben salir **22 de 22 aprobadas**.

## Publicar en GitHub Pages

1. Crea un repositorio público en GitHub (por ejemplo `cafeteria-escolar`).
2. Sube el contenido de esta carpeta, con `index.html` en la raíz del repositorio.
3. Ve a *Settings → Pages → Build and deployment → Source: Deploy from a branch*, elige la rama `main` y la carpeta `/ (root)`, y presiona *Save*.
4. Espera 1 o 2 minutos. La app quedará en `https://TU-USUARIO.github.io/cafeteria-escolar/`.

Con Git, desde la terminal:

```bash
git init
git add .
git commit -m "Versión 1.0.0 de Cafetería Escolar"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/cafeteria-escolar.git
git push -u origin main
```

## Actualizar la app publicada

1. Haz tus cambios.
2. Cambia `VERSION` en `sw.js` (por ejemplo, `cafeteria-v1.0.1`).
3. Ejecuta `git add .`, `git commit -m "..."` y `git push`. GitHub Pages vuelve a publicar automáticamente.
