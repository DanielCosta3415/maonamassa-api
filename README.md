# Mão na Massa - API Fake (JSON Server)

[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://maonamassa-api.vercel.app)
[![Node.js Version](https://img.shields.io/badge/Node.js-16%2B-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

Servidor **JSON Server** com autenticação JWT para simular uma **API REST** do projeto mobile **Mão na Massa** — marketplace hiperlocal de serviços para cidades pequenas e áreas rurais.

---

## 📋 Sobre

**Mão na Massa** é um aplicativo Android (React Native + Expo) que conecta **clientes** a **profissionais autônomos** de serviços (limpeza, manutenção, reformas, etc.), priorizando **simplicidade**, **transparência** e **acesso direto ao profissional**.

Esta API Fake:
- ✅ Simula endpoints REST de um backend real
- ✅ Gerencia autenticação com JWT (json-server-auth)
- ✅ Armazena dados em `db.json` (sem banco de dados externo)
- ✅ Está hospedada em **Vercel** (HTTPS público, deploy contínuo)
- ✅ Ideal para prototipagem, testes e contexto acadêmico

---

## 🚀 Características Principais

### Endpoints REST

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| **POST** | `/auth/register` | Cadastro de novo usuário (cliente ou profissional) |
| **POST** | `/auth/login` | Login (email/telefone + senha) → retorna JWT |
| **GET** | `/users` | Listar usuários (requer JWT) |
| **GET** | `/professionals` | Listar profissionais com filtro (proximidade, categoria) |
| **GET** | `/professionals/:id` | Detalhe de um profissional |
| **PUT** | `/professionals/:id` | Editar perfil do profissional |
| **PUT** | `/professionals/:id/availability` | Definir agenda de disponibilidade |
| **POST** | `/requests` | Criar novo pedido (cliente → profissional) |
| **GET** | `/requests` | Listar pedidos do usuário |
| **GET** | `/requests/:id` | Detalhe de um pedido |
| **PUT** | `/requests/:id` | Atualizar status (criado → aceito → em_andamento → concluido) |
| **DELETE** | `/requests/:id` | Cancelar pedido |
| **POST** | `/requests/:id/reviews` | Criar avaliação (cliente → profissional) |
| **GET** | `/reviews` | Listar avaliações |
| **GET** | `/notifications` | Listar notificações locais |
| **GET** | `/favorites` | Listar profissionais favoritos |
| **GET** | `/categories` | Listar categorias de serviços |
| **GET** | `/health` | Health check (servidor rodando) |

### Entidades do Banco de Dados

```
📦 db.json
├── users               (5 usuários: 3 clientes + 2 profissionais)
├── professionals       (3 profissionais com categorias, preço, avaliações)
├── requests            (4 pedidos em diferentes status)
├── reviews             (2 avaliações)
├── availability_slots  (11 slots de agenda)
├── categories          (8 categorias de serviços)
├── notifications       (3 notificações de exemplo)
└── favorites           (3 favoritos de exemplo)
```

---

## 🛠️ Tech Stack

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| **Runtime** | Node.js | 16+ |
| **API Framework** | JSON Server | 0.17.4 |
| **Autenticação** | json-server-auth (JWT) | 2.1.0 |
| **Server** | Express.js | 4.18.2 |
| **Hospedagem** | Vercel | – |
| **Protocolo** | HTTPS/TLS | – |

---

## 📦 Instalação e Setup

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Git

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/maonamassa-api.git
cd maonamassa-api

# 2. Instale dependências
npm install

# 3. Inicie o servidor local
npm start

# Servidor rodará em: http://localhost:3000
```

### Teste no Navegador ou Postman

```bash
# Abra no navegador
http://localhost:3000/professionals

# Ou use cURL
curl -X GET http://localhost:3000/professionals
```

---

## 🔐 Autenticação JWT

### Cadastro (Register)

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}

# Resposta (201)
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "email": "usuario@example.com",
    "id": 6
  }
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "maria@example.com",
  "password": "senha123"
}

# Resposta (200)
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "email": "maria@example.com",
    "id": 1
  }
}
```

### Usando Token

```bash
GET /users
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# Resposta (200)
[
  { "id": 1, "email": "maria@example.com", "name": "Maria de Lourdes", "role": "client" },
  ...
]
```

---

## 📋 Usuários de Teste

### Clientes

| Email | Senha | Nome | Tipo |
|-------|-------|------|------|
| maria@example.com | senha123 | Maria de Lourdes | Cliente |
| joao@example.com | senha123 | João Pedro | Cliente |
| fernanda@example.com | senha123 | Fernanda Alves | Cliente |

### Profissionais

| Email | Senha | Nome | Categorias |
|-------|-------|------|-----------|
| ana@example.com | senha123 | Ana Paula Silva | Limpeza, Organização |
| carlos@example.com | senha123 | Carlos Henrique | Manutenção, Hidráulica, Elétrica |

---

## 🌐 URLs Públicas

### Produção (Vercel)

```
URL Base: https://maonamassa-api.vercel.app

Endpoints:
- GET  https://maonamassa-api.vercel.app/professionals
- POST https://maonamassa-api.vercel.app/auth/login
- POST https://maonamassa-api.vercel.app/requests
- ...
```

### Desenvolvimento (Local)

```
URL Base: http://localhost:3000

Endpoints:
- GET  http://localhost:3000/professionals
- POST http://localhost:3000/auth/login
- POST http://localhost:3000/requests
- ...
```

---

## 📱 Integração com App React Native

### Configuração em `app/src/api/client.ts`

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use a URL do ambiente
const API_BASE = process.env.API_URL || 'https://maonamassa-api.vercel.app';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Interceptador de Token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Exemplo de Chamada

```typescript
// Services/ProfessionalService.ts
import { apiClient } from '../api/client';

export async function searchProfessionals(lat: number, lon: number) {
  const response = await apiClient.get('/professionals', {
    params: { lat, lon }
  });
  return response.data;
}

// Uso em componente
useEffect(() => {
  const professionals = await searchProfessionals(-19.9167, -43.9345);
  setProfessionals(professionals);
}, []);
```

---

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta GitHub com repositório `maonamassa-api`
- Conta Vercel

### Passos

1. **Push para GitHub**
   ```bash
   git add .
   git commit -m "Setup API Fake para Mão na Massa"
   git push origin main
   ```

2. **Conectar ao Vercel**
   - Acesse https://vercel.com/dashboard
   - Clique "Add New" → "Project"
   - Selecione repositório `maonamassa-api`
   - Vercel detecta `vercel.json` automaticamente
   - Clique "Deploy"

3. **Resultado**
   - API disponível em: `https://maonamassa-api.vercel.app`
   - Deploy automático a cada `git push`
   - HTTPS + TLS automático

---

## 🔄 CI/CD (Deploy Automático)

Sempre que você fizer `git push`:

```
1. GitHub detecta mudança
   ↓
2. Vercel recebe webhook
   ↓
3. Vercel faz build:
   - npm install
   - Valida vercel.json
   ↓
4. Vercel faz deploy
   ↓
5. API atualizada em https://maonamassa-api.vercel.app
   ↓
6. App React Native acessa automaticamente (sem reconfigurar)
```

---

## 📊 Estrutura de Dados (db.json)

### Users

```json
{
  "id": 1,
  "email": "maria@example.com",
  "phone": "31987654321",
  "name": "Maria de Lourdes",
  "role": "client",
  "password": "$2a$10$...(hashed)",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Professionals

```json
{
  "id": 10,
  "userId": 10,
  "name": "Ana Paula - Diarista",
  "bio": "Diarista com 10 anos de experiência",
  "categories": ["limpeza", "organização"],
  "priceReference": 80.0,
  "rating": 4.8,
  "completedCount": 45,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

### Requests

```json
{
  "id": 100,
  "clientId": 1,
  "professionalId": 10,
  "description": "Limpeza geral do apartamento",
  "photos": ["url1", "url2"],
  "location": { "lat": -19.9167, "lon": -43.9345, "address": "Rua A, 123" },
  "status": "concluido",
  "createdAt": "2025-01-20T10:00:00Z",
  "acceptedAt": "2025-01-20T11:00:00Z",
  "completedAt": "2025-01-20T17:30:00Z"
}
```

### Reviews

```json
{
  "id": 1000,
  "requestId": 100,
  "professionalId": 10,
  "clientId": 1,
  "rating": 5,
  "comment": "Excelente trabalho! Muito satisfeito.",
  "createdAt": "2025-01-20T18:00:00Z"
}
```

---

## ⚙️ Scripts Disponíveis

```bash
# Iniciar servidor (produção)
npm start

# Modo desenvolvimento (com nodemon para reload automático)
npm run dev

# Listar dependências
npm list

# Verificar segurança de dependências
npm audit
```

---

## 📚 Documentação Relacionada

- **Documentação do Projeto**: [Repositório maonamassa-app](https://github.com/seu-usuario/maonamassa-app)
- **Especificação de Requisitos**: `docs/02-Especificacao-do-Projeto.md`
- **Arquitetura Técnica**: `docs/05-Arquitetura-da-Solucao.md`
- **JSON Server Docs**: https://github.com/typicode/json-server
- **json-server-auth Docs**: https://github.com/jeromedeleon/json-server-auth

---

## 🧪 Testes

### Testar Endpoints com cURL

```bash
# Listar profissionais
curl -X GET http://localhost:3000/professionals

# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com","password":"senha123"}'

# Criar pedido (requer JWT)
curl -X POST http://localhost:3000/requests \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"clientId":1,"professionalId":10,"description":"Limpeza"}'
```

### Testar com Postman

1. Importe collection: `postman-collection.json` (se fornecido)
2. Configure variável: `{{BASE_URL}}` = `http://localhost:3000` (dev) ou `https://maonamassa-api.vercel.app` (prod)
3. Execute requests

---

## 🐛 Troubleshooting

### Erro: "ENOENT: no such file or directory, open 'db.json'"

**Causa**: `db.json` não está na raiz do projeto

**Solução**:
```bash
# Certifique-se de que db.json está na raiz
ls -la db.json

# Se não existir, copie de novo ou crie um vazio
touch db.json
```

### Erro: "Cannot find module 'json-server'"

**Causa**: Dependências não instaladas

**Solução**:
```bash
npm install
```

### Erro: "Port 3000 is already in use"

**Causa**: Outro processo rodando na porta 3000

**Solução**:
```bash
# Linux/Mac: Liberar porta
lsof -ti:3000 | xargs kill -9

# Windows: Usar outra porta
PORT=3001 npm start
```

---

## 🔒 Segurança

### Senhas
- Todas as senhas em `db.json` estão hashadas com **bcrypt**
- Não comitir senhas em texto plano
- Use variáveis de ambiente para secrets (se necessário)

### JWT
- Token armazenado no cliente via **Expo SecureStore** (criptografado)
- Comunicação via **HTTPS** em produção (Vercel)
- Token incluso em header `Authorization: Bearer <token>`

### LGPD
- Dados coletados são mínimos (email, telefone, nome, localização consentida)
- Política de privacidade deve estar acessível no app
- Direito de exclusão: DELETE `/users/:id` (futuro)

---

## 🎯 Roadmap Futuro

### Fase 2 (Pós-MVP)
- [ ] Migrar para PostgreSQL (persistência real)
- [ ] Integrar Mercado Pago (pagamentos)
- [ ] Implementar push notifications (FCM)

### Fase 3
- [ ] Chat em tempo real (WebSocket)
- [ ] Verificação de identidade (KYC)
- [ ] Dashboard administrativo (painel web)

### Fase 4
- [ ] Suporte a iOS (Expo)
- [ ] Escalabilidade (microserviços)
- [ ] Analytics e relatórios

---

## 📝 Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'Add minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 License

Este projeto está licenciado sob a **MIT License** — veja o arquivo `LICENSE` para detalhes.

---

## 👥 Equipe

**Projeto**: Mão na Massa  
**Instituição**: [PUC Minas](https://www.pucminas.br/)  
**Curso**: Tecnologia em Análise e Desenvolvimento de Sistemas
**Período**: 2025/2

### Membros

| Nome | Papel |
|------|-------|
| Hugo Cesar Ribeiro Caldeira | Product Owner |
| Daniel Lopes da Costa | Scrum Master |
| Lorena Marta Martiniana de Paula | UX/UI Designer |
| [Outros Membros] | Development Team |

---

**Última atualização**: Novembro de 2025  
**Status**: ✅ Pronto para produção (MVP)
