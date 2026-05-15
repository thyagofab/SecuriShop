# Guia Completo de Execução do Projeto XSS-TCC

## Visão Geral

Este projeto é uma aplicação web de e-commerce propositalmente vulnerável, criada para demonstrar ataques XSS em ambiente acadêmico.

Ele é composto por dois serviços:

* Backend (Node.js + Express)
* Frontend (React + Vite)

**Importante:** Você precisará de dois terminais abertos simultaneamente.

---

## Requisitos

Antes de começar, sua instância EC2 deve ter:

* Node.js versão 22 ou superior
* Yarn instalado

**Observação:**
Certifique-se de que as portas abaixo estão liberadas no Security Group da AWS:

* **3001 (Backend/API)**
* **5173 (Frontend/Vite)**

Origem recomendada: `0.0.0.0/0`

---

## Parte 1 — Preparação do ambiente

### Instalação do Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

### 1.1 Se usar NVM, primeiro instale o NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Se precisar atualizar a variável PATH, inicie um novo bash:

```bash
bash
```

Depois instale e use o Node 22:

```bash
nvm install 22
nvm use 22
node --version
```

---

### Instalação do Yarn

```bash
sudo npm install -g yarn
yarn --version
```

---

## Parte 2 — Clone e instalação do projeto

### Clone do repositório

```bash
git clone "https://github.com/thyagofab/xss-tcc.git"

cd xss-tcc
```

### Instalação das dependências

Se usar Yarn:

```bash
yarn install --ignore-engines
```

Se usar npm:

```bash
npm install
```

---

## Configuração do banco de dados (Prisma + SQLite)

```bash
npx prisma generate

npx prisma db push

npx tsx prisma/seed.ts
```

---

### Recompilação do SQLite

```bash
npm rebuild better-sqlite3
```

---

## Parte 3 — Configuração do IP público

### Descobrir IP público

No painel da AWS:

* Copie o Public IPv4 address

---

### Atualizar IP no projeto

```bash
sed -i "s|http://localhost:3001|http://SEU_IP_PUBLICO:3001|g" src/pages/HomePage.tsx src/pages/ContaPage.tsx
```

---

### Verificar atualização

```bash
grep "API_BASE" src/pages/HomePage.tsx src/pages/ContaPage.tsx
```

---

### Configurar Vite para acesso externo

```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
EOF
```

---

## Parte 4 — Execução do projeto

### Terminal 1 — Backend

```bash
cd ~/xss-tcc
npx tsx server.ts
```

Mensagem esperada:

```
API Vulnerável do TCC rodando na porta 3001
```

---

### Terminal 2 — Frontend

Se usar Yarn:

```bash
cd ~/xss-tcc
yarn run dev
```

Se usar npm:

```bash
cd ~/xss-tcc
npm run dev
```

---

## Parte 5 — Acesso ao projeto

Frontend:

```
http://SEU_IP_PUBLICO:5173
```

Backend:

```
http://SEU_IP_PUBLICO:3001/api/products
```

---