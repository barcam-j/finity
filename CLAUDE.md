# CLAUDE.md — finity

## Proyecto
Aplicación web de finanzas personales con análisis por IA configurable por el usuario.
Nombre del repo en GitHub: `barcam-j/finity`

## Stack
| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 + Vite + Pinia + Vue Router |
| Backend | Python 3.11+ + FastAPI |
| Base de datos | MongoDB |
| IA | LiteLLM (abstracción multi-proveedor) |
| Auth | JWT |

## Estructura
```
/
├── frontend/         # Vue 3 + Vite
│   └── src/
│       ├── views/    # Dashboard, Transactions, Analysis, Settings
│       ├── components/
│       ├── stores/   # Pinia (auth, transactions, ai)
│       └── services/ # llamadas al backend
└── backend/          # Python + FastAPI
    ├── app/
    │   ├── routers/  # auth, transactions, analysis, ai, alerts
    │   ├── services/ # lógica de negocio
    │   ├── models/   # esquemas MongoDB
    │   ├── ai/       # LiteLLM adapter + prompts
    │   └── core/     # config, security, db connection
    └── main.py
```

## Comandos de desarrollo
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Variables de entorno (backend/.env)
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=financeai
SECRET_KEY=...
ENCRYPTION_KEY=...
```

## Colecciones MongoDB
- `users` — auth
- `transactions` — datos financieros
- `categories` — categorías por usuario
- `ai_configs` — proveedor + api_key encriptada + modelo
- `alerts` — anomalías detectadas
- `analysis_cache` — resultados IA cacheados

## Convenciones
- Frontend: componentes en PascalCase, composables con prefijo `use`
- Backend: rutas en snake_case, servicios separados de routers
- Las API keys del usuario se guardan encriptadas en MongoDB
- LiteLLM permite cambiar de proveedor IA sin tocar lógica de análisis

## Hoja de ruta
- **v1:** CSV import, CRUD transacciones, alertas IA, dashboard KPIs, config proveedor IA
- **v2:** Chat lenguaje natural, gráficas avanzadas
- **v3:** Predicciones y tendencias
- **v4:** Recomendaciones personalizadas
- **v5:** Módulo de inversiones

## Git
- Rama principal: `main`
- GitHub: `https://github.com/barcam-j/finity`
- Cuenta GitHub: `barcam-j`
