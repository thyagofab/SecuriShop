import express, { type Request, type Response } from 'express';
import prismaPkg from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import cors from 'cors';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'crypto';

const { PrismaClient } = prismaPkg;

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({ adapter });
const app = express();
const sessoesPorToken = new Map<string, number>();
const armazenamentoDemoXss = new Map<string, string[]>();

app.use(cors());

app.use(express.json());

const hashSenha = (senha: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(`${salt}:${senha}`).digest('hex');
  return `${salt}:${hash}`;
};

const validarSenha = (senha: string, hashArmazenado: string) => {
  const [salt, hashOriginal] = hashArmazenado.split(':');
  if (!salt || !hashOriginal) {
    return false;
  }

  const hashTentativa = createHash('sha256').update(`${salt}:${senha}`).digest('hex');
  const bufferOriginal = Buffer.from(hashOriginal, 'hex');
  const bufferTentativa = Buffer.from(hashTentativa, 'hex');

  if (bufferOriginal.length !== bufferTentativa.length) {
    return false;
  }

  return timingSafeEqual(bufferOriginal, bufferTentativa);
};

const extrairToken = (req: Request) => {
  const cabecalho = req.header('authorization');
  if (!cabecalho) {
    return null;
  }

  const [tipo, token] = cabecalho.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const buscarUsuarioAutenticado = async (req: Request) => {
  const token = extrairToken(req);
  if (!token) {
    return null;
  }

  const userId = sessoesPorToken.get(token);
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true }
  });
};

const criarPaginaVulneravel = (titulo: string, corpo: string) => {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${titulo}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 40px;
        line-height: 1.5;
      }
      .box {
        max-width: 900px;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 24px;
      }
      code, pre {
        background: #f6f8fa;
        border-radius: 8px;
        padding: 2px 6px;
      }
    </style>
  </head>
  <body>
    <div class="box">
      ${corpo}
    </div>
  </body>
</html>`;
};

const obterListaDemoXss = (chave: string) => {
  if (!armazenamentoDemoXss.has(chave)) {
    armazenamentoDemoXss.set(chave, []);
  }

  return armazenamentoDemoXss.get(chave)!;
};

const persistirDemoXss = (chave: string, payload?: string) => {
  if (!payload) {
    return;
  }

  const lista = obterListaDemoXss(chave);
  lista.unshift(payload);
  if (lista.length > 25) {
    lista.length = 25;
  }
};

const montarItensDemoXss = (chave: string, autor: string) => {
  return obterListaDemoXss(chave)
    .map((payload) => `<li><strong>${autor}</strong>: <span>${payload}</span></li>`)
    .join('\n');
};

const formatarComentariosEmHtml = async (productId?: string) => {
  const filtro = productId ? Number(productId) : undefined;
  const comments = await prisma.comment.findMany({
    where: Number.isFinite(filtro) ? { productId: filtro } : undefined,
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: { id: 'desc' }
  });

  const itens = comments
    .map((comment) => {
      return `<li><strong>${comment.user.username}</strong>: <span>${comment.content}</span></li>`;
    })
    .join('\n');

  return criarPaginaVulneravel(
    'Comentarios vulneraveis',
    `<h1>Comentarios renderizados sem sanitizacao</h1>
     <p>Endpoint didatico para demonstrar XSS armazenado em HTML.</p>
     <ul>${itens || '<li>Nenhum comentario encontrado.</li>'}</ul>`
  );
};

app.get('/demo/xss/search', async (req: Request, res: Response) => {
  const termo = String(req.query.q ?? 'busca vazia');
  const pagina = criarPaginaVulneravel(
    'Busca vulneravel',
    `<h1>Resultado da busca</h1>
     <p>Voce pesquisou por: ${termo}</p>
     <p>Esse campo e refletido diretamente no HTML para fins didaticos.</p>`
  );

  res.type('html').send(pagina);
});

app.get('/demo/xss/reflected', async (req: Request, res: Response) => {
  const payload = String(req.query.payload ?? req.query.q ?? 'valor-vazio');
  const pagina = criarPaginaVulneravel(
    'Reflected XSS demo',
    `<h1>Reflected XSS</h1>
     <p>Entrada refletida sem sanitizacao:</p>
     <div id="resultado">${payload}</div>`
  );

  res.type('html').send(pagina);
});

app.get('/demo/xss/stored', async (req: Request, res: Response) => {
  const chave = String(req.query.key ?? req.query.productId ?? 'default');
  const payload = req.query.payload ? String(req.query.payload) : undefined;

  persistirDemoXss(chave, payload);

  const itens = montarItensDemoXss(chave, 'Visitante');
  const pagina = criarPaginaVulneravel(
    'Stored XSS demo',
    `<h1>Stored XSS</h1>
     <p>Payload persistido em memoria e exibido sem sanitizacao.</p>
     <ul>${itens || '<li>Nenhum payload armazenado.</li>'}</ul>`
  );

  res.type('html').send(pagina);
});

app.get('/demo/xss/dom', async (_req: Request, res: Response) => {
  const pagina = criarPaginaVulneravel(
    'DOM XSS demo',
    `<h1>DOM-based XSS</h1>
     <p>Use um payload no hash da URL (apos #).</p>
     <div id="dom-target">Aguardando hash...</div>
     <script>
       const hash = window.location.hash.slice(1);
       document.getElementById('dom-target').innerHTML = hash || 'Sem payload';
     </script>`
  );

  res.type('html').send(pagina);
});

app.get('/demo/xss/comments', async (req: Request, res: Response) => {
  const pagina = await formatarComentariosEmHtml(String(req.query.productId ?? ''));
  res.type('html').send(pagina);
});

app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});


app.post('/api/auth/register', async (req: Request, res: Response) => {
  const nome = String(req.body?.nome ?? req.body?.username ?? '').trim();
  const email = String(req.body?.email ?? req.body?.username ?? '').trim().toLowerCase();
  const senha = String(req.body?.password ?? '');

  if (nome.length < 3) {
    res.status(400).json({ error: 'Nome deve ter no minimo 3 caracteres.' });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Informe um e-mail valido.' });
    return;
  }

  if (senha.length < 4) {
    res.status(400).json({ error: 'Senha deve ter no minimo 4 caracteres.' });
    return;
  }

  try {
    const existente = await prisma.user.findUnique({ where: { email } });
    if (existente) {
      res.status(409).json({ error: 'E-mail ja cadastrado.' });
      return;
    }

    const usuario = await prisma.user.create({
      data: {
        username: nome,
        email,
        password: hashSenha(senha)
      },
      select: { id: true, username: true }
    });

    const token = randomUUID();
    sessoesPorToken.set(token, usuario.id);
    res.status(201).json({ token, user: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuario.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? req.body?.username ?? '').trim().toLowerCase();
  const senha = String(req.body?.password ?? '');

  if (!email) {
    res.status(400).json({ error: 'Informe o e-mail para login.' });
    return;
  }

  try {
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario || !validarSenha(senha, usuario.password)) {
      res.status(401).json({ error: 'Credenciais invalidas.' });
      return;
    }

    const token = randomUUID();
    sessoesPorToken.set(token, usuario.id);
    res.json({
      token,
      user: {
        id: usuario.id,
        username: usuario.username
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao autenticar usuario.' });
  }
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const usuario = await buscarUsuarioAutenticado(req);
    if (!usuario) {
      res.status(401).json({ error: 'Sessao invalida.' });
      return;
    }

    res.json({ user: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar sessao.' });
  }
});


app.post('/api/comments', async (req: Request, res: Response) => {
  const usuario = await buscarUsuarioAutenticado(req);
  if (!usuario) {
    res.status(401).json({ error: 'Voce precisa estar logado para comentar.' });
    return;
  }

  const { productId, content } = req.body;
  const conteudo = String(content ?? '').trim();

  if (!conteudo) {
    res.status(400).json({ error: 'Comentario nao pode estar vazio.' });
    return;
  }
  
  try {
    const newComment = await prisma.comment.create({
      data: {
        content: conteudo,
        productId: Number(productId),
        userId: usuario.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar comentário" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Vulnerável do TCC rodando na porta ${PORT}`);
});