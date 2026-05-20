import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import prismaPkg from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import xss from 'xss';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import { resetCommentsOnly } from './prisma/seedData';

const { PrismaClient } = prismaPkg;

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({ adapter });
const app = express();
const sessoesPorToken = new Map<string, number>();
const armazenamentoDemoXss = new Map<string, string[]>();
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const XSS_DEMO_ENABLED =
  !process.env.ENABLE_XSS_DEMO ||
  !['false', '0', 'off'].includes(process.env.ENABLE_XSS_DEMO.toLowerCase());

const politicaCsp = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", CLIENT_ORIGIN]
    }
  }
});

const permitirOrigem = (origin: string | undefined) => {
  if (!origin) {
    return true;
  }

  if (origin === CLIENT_ORIGIN) {
    return true;
  }

  return origin.startsWith('http://localhost:517');
};

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, permitirOrigem(origin));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
  const headerModoSeguro = req.header('x-secure-mode');
  const isSecureMode = headerModoSeguro
    ? !['false', '0', 'off'].includes(headerModoSeguro.toLowerCase())
    : !XSS_DEMO_ENABLED;

  res.locals.isSecureMode = isSecureMode;
  next();
});

app.use((req, res, next) => {
  if (!res.locals.isSecureMode) {
    next();
    return;
  }

  politicaCsp(req, res, next);
});

if (XSS_DEMO_ENABLED) {
  app.use((req, _res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('[payload]', req.method, req.path, req.body);
    }
    next();
  });
}

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

const configurarCookieSessao = (req: Request, res: Response, token: string) => {
  const isSecureMode = Boolean(res.locals.isSecureMode);
  const isHttps = req.secure || req.header('x-forwarded-proto') === 'https';

  res.cookie('session', token, {
    httpOnly: isSecureMode,
    secure: isSecureMode ? isHttps : false,
    sameSite: isSecureMode ? 'strict' : 'lax',
    path: '/'
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

const sanitizeStrict = (payload: string) =>
  xss(payload, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });

const persistirDemoXss = (chave: string, payload?: string, isSecureMode = false) => {
  if (!payload) {
    return;
  }

  const lista = obterListaDemoXss(chave);
  const conteudo = isSecureMode ? sanitizeStrict(payload) : payload;
  lista.unshift(conteudo);
  if (lista.length > 25) {
    lista.length = 25;
  }
};

const montarItensDemoXss = (chave: string, autor: string) => {
  return obterListaDemoXss(chave)
    .map((payload) => `<li><strong>${autor}</strong>: <span>${payload}</span></li>`)
    .join('\n');
};

const formatarComentariosEmHtml = async (productId?: string, isSecureMode = false) => {
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
      const usuario = isSecureMode
        ? sanitizeStrict(comment.user.username)
        : comment.user.username;
      const conteudo = isSecureMode
        ? sanitizeStrict(comment.content)
        : comment.content;
      return `<li><strong>${usuario}</strong>: <span>${conteudo}</span></li>`;
    })
    .join('\n');

  return criarPaginaVulneravel(
    'Comentarios vulneraveis',
    `<h1>Comentarios renderizados sem sanitizacao</h1>
     <p>Endpoint didatico para demonstrar XSS armazenado em HTML.</p>
     <ul>${itens || '<li>Nenhum comentario encontrado.</li>'}</ul>`
  );
};

if (XSS_DEMO_ENABLED) {
  app.get('/demo/xss/search', async (req: Request, res: Response) => {
    const isSecureMode = Boolean(res.locals.isSecureMode);
    const termo = String(req.query.q ?? 'busca vazia');
    const termoSeguro = isSecureMode ? sanitizeStrict(termo) : termo;
    const pagina = criarPaginaVulneravel(
      'Busca vulneravel',
      `<h1>Resultado da busca</h1>
       <p>Voce pesquisou por: ${termoSeguro}</p>
       <p>Esse campo e refletido diretamente no HTML para fins didaticos.</p>`
    );

    res.type('html').send(pagina);
  });

  app.get('/demo/xss/reflected', async (req: Request, res: Response) => {
    const isSecureMode = Boolean(res.locals.isSecureMode);
    const payload = String(req.query.payload ?? req.query.q ?? 'valor-vazio');
    const payloadSeguro = isSecureMode ? sanitizeStrict(payload) : payload;
    const pagina = criarPaginaVulneravel(
      'Reflected XSS demo',
      `<h1>Reflected XSS</h1>
       <p>Entrada refletida sem sanitizacao:</p>
       <div id="resultado">${payloadSeguro}</div>`
    );

    res.type('html').send(pagina);
  });

  app.get('/demo/xss/stored', async (req: Request, res: Response) => {
    const isSecureMode = Boolean(res.locals.isSecureMode);
    const chave = String(req.query.key ?? req.query.productId ?? 'default');
    const payload = req.query.payload ? String(req.query.payload) : undefined;

    persistirDemoXss(chave, payload, isSecureMode);

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
    const isSecureMode = Boolean(res.locals.isSecureMode);
    const domScript = isSecureMode
      ? `const hash = window.location.hash.slice(1);
         document.getElementById('dom-target').textContent = hash || 'Sem payload';`
      : `const hash = window.location.hash.slice(1);
         document.getElementById('dom-target').innerHTML = hash || 'Sem payload';`;
    const pagina = criarPaginaVulneravel(
      'DOM XSS demo',
      `<h1>DOM-based XSS</h1>
       <p>Use um payload no hash da URL (apos #).</p>
       <div id="dom-target">Aguardando hash...</div>
       <script>
         ${domScript}
       </script>`
    );

    res.type('html').send(pagina);
  });

  app.get('/demo/xss/comments', async (req: Request, res: Response) => {
    const isSecureMode = Boolean(res.locals.isSecureMode);
    const pagina = await formatarComentariosEmHtml(String(req.query.productId ?? ''), isSecureMode);
    res.type('html').send(pagina);
  });
} else {
  app.use('/demo/xss', (_req, res) => {
    res.status(404).json({ error: 'Rotas de demonstracao desativadas.' });
  });
}

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

app.get('/api/products/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'ID invalido.' });
    return;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      res.status(404).json({ error: 'Produto nao encontrado.' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produto.' });
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
    configurarCookieSessao(req, res, token);
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
    configurarCookieSessao(req, res, token);
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
  const conteudoBruto = String(content ?? '').trim();
  const conteudo = res.locals.isSecureMode ? xss(conteudoBruto) : conteudoBruto;

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

app.post('/api/admin/reset', async (_req: Request, res: Response) => {
  if (!XSS_DEMO_ENABLED) {
    res.status(403).json({ error: 'Modo demo desativado.' });
    return;
  }

  try {
    await resetCommentsOnly(prisma);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao resetar banco.' });
  }
});
app.listen(PORT, () => {
  console.log(`API Vulnerável do TCC rodando na porta ${PORT}`);
});