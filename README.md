# FoodLoop

**FoodLoop** es una red social PWA para reducir el desperdicio de alimentos en comunidades universitarias. Los usuarios publican comida próxima a vencer, otros la reclaman antes de que expire, y coordinan la entrega por chat en tiempo real. Una IA integrada sugiere recetas y consejos de conservación para aprovechar al máximo cada ingrediente.

Desarrollado por el equipo **Cypher Cosmos** para DevWeek 26.

Puedes probar la demo aquí:
[![Demo en vivo](https://img.shields.io/badge/demo-live-brightgreen)](https://foodloop-one.vercel.app)

---

## Características

- **Feed de publicaciones** — Lista de alimentos disponibles con filtros: expiran hoy, gratuitos, de cafetería.
- **Publicar alimento** — Foto, descripción, fecha de vencimiento, tipo de oferta (gratuito o precio simbólico) y punto de recojo.
- **Reclamar y chatear** — Al reclamar un alimento se abre un chat en tiempo real entre el publicador y el reclamante.
- **Asistente IA** — Genera recetas a partir de ingredientes disponibles y tips de conservación, usando Gemini.
- **Notificaciones** — Alertas en tiempo real cuando alguien reclama tu publicación.
- **Perfiles** — Usuario regular o cafetería, con avatar y historial de actividad.
- **PWA** — Instalable en móvil y escritorio, funciona como app nativa.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Autenticación | Supabase Auth (email/contraseña) |
| Storage | Supabase Storage |
| Tiempo real | Supabase Realtime |
| IA | Google Gemini (`gemini-3.1-flash-lite`) |
| Deploy | Vercel |

---

## Instalación local

### Requisitos previos

- Node.js 18+
- Una cuenta de [Supabase](https://supabase.com) con proyecto creado
- Una API Key de [Google AI Studio](https://aistudio.google.com)

### Pasos

1. **Clonar el repositorio**

```bash
git clone <url-del-repo>
cd foodloop
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
GEMINI_API_KEY=tu_gemini_api_key
```

4. **Configurar la base de datos**

Ejecuta el esquema SQL incluido en `supabase/schema.sql` desde el editor SQL de Supabase. Asegúrate de tener los buckets de Storage creados: `post-images` y `avatars` (ambos públicos).

5. **Correr en desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Uso

1. **Registro** — Crea una cuenta indicando tu nombre y tipo de usuario (persona o cafetería).
2. **Feed** — Navega las publicaciones disponibles. Usa los filtros para ver solo las que expiran hoy, las gratuitas o las de cafeterías.
3. **Publicar** — Toca el botón `+` en la barra inferior, sube una foto, completa los datos y publica.
4. **Reclamar** — En el detalle de una publicación toca **Quiero esto**. Se abre un chat directo con el publicador para coordinar la entrega.
5. **IA** — Ve a la sección **IA** desde el menú. Escribe los ingredientes que tienes o el alimento que quieres conservar y obtén sugerencias al instante.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro
│   ├── (app)/           # Páginas protegidas (feed, chat, IA, perfil)
│   └── api/             # API Routes (auth, posts, claims, IA)
├── components/
│   ├── feature/         # Componentes de dominio (PostCard, ChatPanel, etc.)
│   └── ui/              # Componentes base reutilizables
└── lib/
    ├── supabase/        # Clientes server y browser
    ├── gemini.ts        # Wrapper de la API de Gemini
    └── types.ts         # Tipos TypeScript del dominio
```

---

## Equipo

**Cypher Cosmos** — DevWeek 26
