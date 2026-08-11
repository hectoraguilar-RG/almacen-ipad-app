# Sistema de Control de Almacén - iPad

Aplicación Web Progresiva (PWA) optimizada para iPad para la gestión visual e interactiva de almacén, diseñada para operar mediante dos usuarios principales (Administrador y Operador).

## 🚀 Características Principales
- **Registro Multi-producto:** Carga de lotes de productos en una misma transacción de entrada o salida.
- **Tipos de Movimientos Flexibles:**
  - Entradas por compras.
  - Salidas asignadas a colaboradores.
  - Ajustes de inventario por auditoría (errores de conteo inicial, mermas).
  - Transferencias inter-plantel sin afectación a empleados.
- **Evidencia Fotográfica:** Captura directa con la cámara del iPad.
- **Escáner de Código de Barras (SKU):** Lectura rápida con la cámara para entradas, salidas y consulta de stock.
- **Historial e Interacción Visual:** Filtros por producto, movimientos generales o individuales (Entradas/Salidas/Ajustes).
- **Métricas y Reportes:** Ranking de consumo por empleado y productos de alta rotación.

## 🛠️ Stack Tecnológico
- **Frontend:** React / Tailwind CSS (PWA optimizada para pantalla táctil de iPad).
- **Backend / Base de Datos:** Supabase / Firebase (PostgreSQL + Bucket para fotos).
- **Control de Versiones:** GitHub.

## 📂 Estructura del Repositorio

/
├── docs/                 # Guías de migración y plantillas CSV
├── src/
│   ├── components/       # Escáner SKU, Modales, Filtros, Tabla
│   ├── views/            # Catálogo, Movimientos, Auditoría, Reportes
│   ├── context/          # Carrito de transacciones, Autenticación
│   └── services/         # Conexión con base de datos y cámara
├── public/               # Assets y manifiesto PWA para iPad
└── README.md
