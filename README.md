# finity

Aplicación de finanzas personales con análisis profundo mediante IA configurable por el usuario.

## Descripcion

finity es una aplicación web de finanzas personales que permite importar datos financieros históricos y analizarlos mediante inteligencia artificial. El usuario puede configurar el proveedor de IA de su elección (Claude, OpenAI, Gemini, etc.) usando su propia suscripción y API key.

La aplicación está construida en dos partes bien diferenciadas: un frontend moderno en Vue 3 y un backend robusto en Python con FastAPI.

---

## Stack tecnológico

| Capa          | Tecnología                        | Razón                                                                         |
| ------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| Frontend      | Vue 3 + Vite + Pinia + Vue Router | Moderno, reactivo, ecosistema maduro                                          |
| Backend       | Python + FastAPI                  | Async nativo, ideal para llamadas a IA, auto-documentación                    |
| Base de datos | MongoDB                           | Flexible para estructuras variables de transacciones y resultados de análisis |
| IA            | LiteLLM (capa de abstracción)     | Soporta Claude, OpenAI, Gemini, Mistral... con la misma interfaz              |
| Auth          | JWT (tokens)                      | Simple y seguro para uso personal                                             |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Vue 3)                  │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│  Auth    │Dashboard │Transacc. │ Análisis │Configur.│
│ Login/   │ KPIs     │ Importar │ Gráficas │ API Keys│
│ Register │ Resumen  │ CSV      │ IA Chat  │ Proveedor│
│          │ Alertas  │ Listado  │ Reportes │ Perfil  │
└──────────┴──────────┴──────────┴──────────┴─────────┘
                          │ HTTP/REST
┌─────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                  │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│  Auth    │Transacc. │ Análisis │    IA    │ Alertas │
│ Service  │ Service  │ Service  │ Service  │ Service │
│ JWT      │ CSV Parse│ Agrega-  │LiteLLM   │Anomaly  │
│ Users    │ CRUD     │ ciones   │Abstrac.  │Detection│
└──────────┴──────────┴──────────┴──────────┴─────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                    MongoDB                           │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│  users   │transact. │categories│ai_configs│ alerts  │
│          │          │          │(por user)│         │
└──────────┴──────────┴──────────┴──────────┴─────────┘
```

---

## Estructura del proyecto

```
/
├── frontend/                  # Vue 3 + Vite
│   ├── src/
│   │   ├── views/             # Dashboard, Transactions, Analysis, Settings
│   │   ├── components/        # Charts, AlertCard, TransactionTable...
│   │   ├── stores/            # Pinia (auth, transactions, ai)
│   │   └── services/          # API calls al backend
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/                   # Python + FastAPI
    ├── app/
    │   ├── routers/           # auth, transactions, analysis, ai, alerts
    │   ├── services/          # lógica de negocio
    │   ├── models/            # esquemas MongoDB (Beanie/Motor)
    │   ├── ai/                # LiteLLM adapter + prompts
    │   └── core/              # config, security, db connection
    ├── main.py
    └── requirements.txt
```

---

## Base de datos — Colecciones MongoDB

| Colección        | Campos principales                                                                      |
| ---------------- | --------------------------------------------------------------------------------------- |
| `users`          | `_id`, `email`, `password_hash`, `created_at`                                           |
| `transactions`   | `_id`, `user_id`, `date`, `amount`, `category`, `description`, `source`, `tags`         |
| `categories`     | `_id`, `user_id`, `name`, `type` (income/expense), `color`, `icon`                      |
| `ai_configs`     | `_id`, `user_id`, `provider`, `api_key` (encrypted), `model`, `params`                  |
| `alerts`         | `_id`, `user_id`, `type`, `message`, `severity`, `transaction_id`, `seen`, `created_at` |
| `analysis_cache` | `_id`, `user_id`, `period`, `result`, `generated_at`                                    |

---

## IA configurable por usuario

El usuario configura desde la aplicación su proveedor de IA preferido:

- **Proveedor:** Claude (Anthropic), OpenAI, Gemini, Mistral, u otros compatibles
- **API Key:** introducida por el usuario, guardada encriptada en MongoDB
- **Modelo:** el usuario elige el modelo concreto (ej. `claude-sonnet-4-6`, `gpt-4o`)

La capa de abstracción con **LiteLLM** permite que el backend use cualquier proveedor con la misma interfaz, sin cambios en la lógica de análisis.

---

## Flujo principal — Importar CSV y analizar

```
1. Usuario sube CSV
       ↓
2. Backend parsea y normaliza transacciones
       ↓
3. Se guardan en MongoDB (transactions)
       ↓
4. Se dispara análisis automático:
   - Estadísticas (agrupaciones por categoría/mes)
   - Detección de anomalías (gastos inusuales)
       ↓
5. Si hay anomalía → se llama a LiteLLM con contexto
       ↓
6. IA genera explicación y severidad
       ↓
7. Se crea alerta → visible en dashboard
```

---

## Features — Hoja de ruta por fases

| Fase | Feature                                   | Estado    |
| ---- | ----------------------------------------- | --------- |
| v1   | Importación CSV + CRUD de transacciones   | Pendiente |
| v1   | Detección de anomalías y alertas con IA   | Pendiente |
| v1   | Dashboard con KPIs básicos                | Pendiente |
| v1   | Configuración de proveedor IA por usuario | Pendiente |
| v2   | Chat en lenguaje natural con los datos    | Pendiente |
| v2   | Gráficas y visualización avanzada         | Pendiente |
| v3   | Predicciones y análisis de tendencias     | Pendiente |
| v4   | Recomendaciones personalizadas            | Pendiente |
| v5   | Módulo de inversiones                     | Pendiente |

---

## Requisitos previos

- Node.js >= 18
- Python >= 3.11
- MongoDB >= 6.0
- Cuenta en al menos un proveedor de IA (Anthropic, OpenAI, etc.)

---

## Instalación y arranque

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Variables de entorno

Crea un archivo `.env` en `/backend` con:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=financeai
SECRET_KEY=tu_clave_secreta_jwt
ENCRYPTION_KEY=tu_clave_para_encriptar_api_keys
```

---

## Sistema de colores

Los colores del frontend usan **OKLCH** (perceptualmente uniforme, listo para P3) y siguen una arquitectura de dos capas separada en archivos:

```
src/styles/
├── primitives.css       — paleta raw (--orange-500, --gray-100...)
├── themes/
│   ├── light.css        — tokens semánticos light
│   └── dark.css         — tokens semánticos dark
├── base.css             — reset + tipografía
└── main.css             — entry point, importa en orden correcto
```

**Primitivos → Semánticos:**

```css
/* primitives.css — valor raw */
--orange-500: oklch(0.7 0.19 42);

/* themes/light.css — intención */
--accent: var(--orange-500);
--btn-bg: var(--accent);
```

- Para cambiar el color de acento: edita `--orange-500` en `primitives.css`
- Para añadir un tema nuevo (ej. high-contrast): crea `themes/high-contrast.css` e impórtalo en `main.css`
- Nunca uses primitivos directamente en componentes, siempre a través de tokens semánticos

---

## Licencia

Uso personal. Sin licencia pública por ahora.
