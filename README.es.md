# Lomi-tero - Aplicación de Gestión de Comida Rápida

Lomi-tero es una aplicación web moderna diseñada para la gestión eficiente de un negocio de comida rápida. Permite administrar diferentes aspectos del negocio, desde la toma de pedidos hasta la gestión de inventario y el análisis financiero. Está construida con tecnologías web modernas para ofrecer una experiencia de usuario fluida y receptiva.

## Características Principales

La aplicación se divide en varios módulos y roles de usuario para cubrir las necesidades de los diferentes actores del negocio:

*   **Autenticación Segura**: Sistema de inicio de sesión y registro para clientes, personal y administradores. Incluye verificación de correo electrónico para clientes.
*   **Módulo de Administración**:
    *   **Dashboard (Panel de Control)**: Visualización general de estadísticas clave del negocio.
    *   **Gestión de Sucursales**: Administración de las diferentes ubicaciones del restaurante.
    *   **Gestión de Categorías**: Organización de los productos en diferentes categorías (ej. Lomitos, Hamburguesas, Bebidas).
    *   **Gestión de Productos**: Creación, edición y eliminación de productos del menú, incluyendo nombre, descripción, precio e imagen.
    *   **Gestión de Ingredientes**: Administración de los ingredientes utilizados en los productos.
    *   **Gestión de Stock**: Seguimiento del inventario de ingredientes por sucursal.
    *   **Gestión de Clientes**: Visualización y administración de la información de los clientes registrados.
    *   **Gestión de Pedidos (Admin)**: Visualización y seguimiento de todos los pedidos realizados.
    *   **Informe Financiero**: Reportes sobre ventas y rendimiento financiero.
*   **Módulo de Personal (Staff)**:
    *   Toma y gestión de pedidos de los clientes.
    *   Visualización de pedidos pendientes y en preparación.
*   **Módulo de Cocina**:
    *   Visualización de los pedidos que necesitan ser preparados.
    *   Actualización del estado de los pedidos (ej. En preparación, Listo para recoger).
*   **Módulo de Cliente**:
    *   Navegación por el menú digital.
    *   Realización de pedidos online.
    *   Seguimiento del estado de sus pedidos.
    *   Historial de pedidos.

## Tecnologías Utilizadas

*   **Frontend**:
    *   **React**: Biblioteca de JavaScript para construir interfaces de usuario.
    *   **Vite**: Herramienta de desarrollo frontend rápida para proyectos modernos.
    *   **Tailwind CSS**: Framework de CSS de utilidad para un diseño rápido y personalizado.
    *   **Radix UI**: Componentes de UI accesibles y no estilizados.
    *   **Framer Motion**: Biblioteca para animaciones.
    *   **Lucide Icons**: Biblioteca de iconos SVG.
*   **Backend & Base de Datos**:
    *   **Supabase**: Plataforma de backend como servicio (BaaS) que proporciona base de datos PostgreSQL, autenticación, almacenamiento y APIs en tiempo real.
*   **Gestión de Estado**:
    *   **Zustand**: Gestor de estado pequeño, rápido y escalable para React.
*   **Enrutamiento**:
    *   **React Router DOM**: Para la navegación dentro de la aplicación.

## Ejecutar el Proyecto Localmente

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

1.  **Clonar el repositorio**:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instalar dependencias**:
    Asegúrate de tener Node.js y npm (o yarn) instalados.
    ```bash
    npm install
    # o
    # yarn install
    ```

3.  **Configurar las variables de entorno de Supabase**:
    *   Crea un archivo `.env` en la raíz del proyecto.
    *   Añade tus credenciales de Supabase (URL y clave anónima pública):
        ```env
        VITE_SUPABASE_URL=TU_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
        ```
    *   Puedes obtener estas credenciales desde el panel de tu proyecto en Supabase (Configuración -> API).

4.  **Ejecutar la aplicación en modo desarrollo**:
    ```bash
    npm run dev
    # o
    # yarn dev
    ```
    Esto iniciará la aplicación y podrás acceder a ella en tu navegador, generalmente en `http://localhost:5173`.

## Próximos Pasos y Mejoras (Ejemplos)

*   Implementar notificaciones en tiempo real para actualizaciones de pedidos.
*   Añadir más opciones de personalización para los productos.
*   Desarrollar un sistema de reseñas y calificaciones de productos.
*   Optimizar el rendimiento para grandes volúmenes de datos.

---

Este README proporciona una visión general de la aplicación Lomi-tero. Para obtener información más detallada sobre componentes específicos o flujos de trabajo, consulta el código fuente y la documentación de las bibliotecas utilizadas.
