# Sistema de Gestão de TCCs

Aplicação web para gestão de Trabalhos de Conclusão de Curso. O backend é uma API
REST em Django REST Framework e o frontend é uma SPA em Angular 19 com Angular
Material, incluindo dashboard de estatísticas, CRUD completo e upload de arquivo.

## Tecnologias

- **Backend:** Django 6 + Django REST Framework
- **Frontend:** Angular 19 (standalone) + Angular Material + Chart.js (ng2-charts)
- **Banco:** SQLite em desenvolvimento; PostgreSQL em produção
- **Infra:** Docker / docker-compose; deploy em Render (backend) + Neon (Postgres)

## Estrutura

```
.
├── core/                 # app Django (models, views, serializers)
├── tcc_project/          # settings, urls, wsgi
├── manage.py
├── load.py               # popula dados de exemplo
├── requirements.txt
├── Dockerfile            # backend
├── docker-compose.yml    # db + backend + frontend
└── frontend/             # aplicação Angular
```

## Funcionalidades

- Dashboard com totais e gráficos (status, tipo, semestre, orientadores)
- CRUD de Unidades, Departamentos, Cursos, Alunos, Professores e TCCs
- Busca de alunos, professores e TCCs
- Upload e download do PDF do TCC
- Filtro de TCCs por status; tema claro/escuro

## Executar localmente (sem Docker)

**Backend:**

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python load.py                   # dados de exemplo (opcional)
python manage.py runserver       # http://localhost:8000
```

**Frontend (em outro terminal):**

```bash
cd frontend
npm install
npm start                        # http://localhost:4200
```

## Executar com Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:4200
- Backend: http://localhost:8000
- Popular dados: `docker compose exec backend python load.py`

## Produção

- **Banco:** PostgreSQL no [Neon](https://neon.tech) (connection string em `DATABASE_URL`).
- **Backend:** Web Service no [Render](https://render.com) (runtime Python), com
  build `pip install -r requirements.txt && python manage.py collectstatic --noinput`,
  pre-deploy `python manage.py migrate` e start `gunicorn tcc_project.wsgi:application`.
- **Frontend:** Static Site no Render (build `npm ci && npm run build`, publish
  `dist/frontend/browser`, rewrite `/*` → `/index.html`).

Variáveis de ambiente do backend: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`.
Ver `.env.example`.

**Aplicação em produção:**

- Frontend: https://gestao-tccs-web.onrender.com
- API: https://gestao-tccs.onrender.com/api/

> O backend usa o plano gratuito do Render e hiberna após alguns minutos sem uso;
> o primeiro acesso pode levar até ~1 minuto para "acordar" o serviço.

## Endpoints da API

- `GET/POST /api/unidades-academicas/`
- `GET/POST /api/departamentos/`
- `GET/POST /api/cursos/`
- `GET/POST /api/alunos/?search=`
- `GET/POST /api/professores/?search=`
- `GET/POST /api/tccs/?search=`
- `GET /api/tccs/estatisticas/`

O campo `arquivo` do TCC é enviado como `multipart/form-data`. Status: `0` Em
Elaboração, `1` Enviado, `2` Aprovado, `3` Reprovado.
