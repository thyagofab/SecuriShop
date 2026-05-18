import { createHash, randomBytes } from 'crypto';
import type { PrismaClient } from '@prisma/client';

const hashSenha = (senha: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(`${salt}:${senha}`).digest('hex');
  return `${salt}:${hash}`;
};

type ComentarioSeed = {
  content: string;
  username: string;
};

type ProdutoSeed = {
  name: string;
  description: string;
  comments: ComentarioSeed[];
};

const USUARIOS = [
  { username: 'Ana Silva', email: 'ana@nexora.com', password: '1234' },
  { username: 'Bruno Santos', email: 'bruno@nexora.com', password: '1234' },
  { username: 'Carla Souza', email: 'carla@nexora.com', password: '1234' }
];

const PRODUTOS: ProdutoSeed[] = [
  {
    name: 'Acer Nitro 5 - TCC Edition',
    description: 'Notebook de alta performance para testes de intrusao.',
    comments: [
      { content: 'Melhor notebook que ja comprei!', username: 'Ana Silva' },
      { content: 'Atencao: Testando <b>HTML</b> no comentario.', username: 'Bruno Santos' }
    ]
  },
  {
    name: 'Galaxy M13 4GB 64GB',
    description: 'Smartphone intermediario com foco em bateria de longa duracao.',
    comments: [
      { content: 'Bom custo-beneficio para uso diario.', username: 'Ana Silva' },
      { content: 'Tela boa e bateria dura bastante.', username: 'Carla Souza' }
    ]
  },
  {
    name: 'Galaxy M33 5G 6GB 128GB',
    description: 'Modelo 5G com desempenho equilibrado para estudo e trabalho.',
    comments: [
      { content: '5G funcionou muito bem na minha regiao.', username: 'Bruno Santos' },
      { content: 'Desempenho estavel para apps pesados.', username: 'Carla Souza' }
    ]
  },
  {
    name: 'Galaxy S22 Ultra 256GB',
    description: 'Smartphone premium com camera avancada e alta performance.',
    comments: [
      { content: 'Camera excelente para foto noturna.', username: 'Ana Silva' },
      { content: 'Aparelho rapido e acabamento premium.', username: 'Bruno Santos' }
    ]
  },
  {
    name: 'Monitor UltraWide Vision Pro 29',
    description: 'Monitor ultrawide ideal para produtividade e multitarefa.',
    comments: [
      { content: 'Excelente para trabalhar com duas janelas.', username: 'Bruno Santos' },
      { content: 'Imagem nitida e cores bem equilibradas.', username: 'Carla Souza' }
    ]
  },
  {
    name: 'Caderno Smart Notes 360',
    description: 'Caderno inteligente reutilizavel para anotacoes e estudos.',
    comments: [
      { content: 'Perfeito para organizacao no dia a dia.', username: 'Ana Silva' },
      { content: 'Gostei da praticidade para revisar materia.', username: 'Carla Souza' }
    ]
  },
  {
    name: 'Teclado Mecanico RGB Pro',
    description: 'Teclado mecanico com switches blue e iluminacao RGB personalizavel.',
    comments: [
      { content: 'Digitacao muito confortavel para programar.', username: 'Bruno Santos' },
      { content: 'Iluminacao bonita e facil de configurar.', username: 'Carla Souza' }
    ]
  },
  {
    name: 'Mouse Gamer Falcon X',
    description: 'Mouse com alta precisao e ajuste de DPI para jogos e produtividade.',
    comments: [
      { content: 'Pegada excelente e sensor muito preciso.', username: 'Ana Silva' },
      { content: 'Leve e muito bom para FPS.', username: 'Bruno Santos' }
    ]
  },
  {
    name: 'Headset Pulse 7.1',
    description: 'Headset com audio surround virtual e microfone removivel.',
    comments: [
      { content: 'Audio limpo e bom isolamento de ruido.', username: 'Bruno Santos' },
      { content: 'Uso em call e jogo sem cansar.', username: 'Carla Souza' }
    ]
  },
  {
    name: 'Webcam Stream HD 1080p',
    description: 'Webcam Full HD para aulas, reunioes e criacao de conteudo.',
    comments: [
      { content: 'Imagem nitida para videochamadas.', username: 'Ana Silva' },
      { content: 'Funcionou plug-and-play no meu setup.', username: 'Carla Souza' }
    ]
  },
  {
    name: 'Notebook DevBook Air 14',
    description: 'Notebook compacto com foco em produtividade para desenvolvimento.',
    comments: [
      { content: 'Leve, rapido e perfeito para levar para faculdade.', username: 'Bruno Santos' },
      { content: 'Boa autonomia de bateria no uso diario.', username: 'Ana Silva' }
    ]
  },
  {
    name: 'Monitor PixelView 24 IPS',
    description: 'Monitor 24 polegadas com painel IPS e cores vivas.',
    comments: [
      { content: 'Excelente qualidade de imagem para programacao.', username: 'Carla Souza' },
      { content: 'Otimo custo-beneficio para setup home office.', username: 'Ana Silva' }
    ]
  },
  {
    name: 'Caderno Study Planner Max',
    description: 'Caderno de organizacao academica com planejamento semanal.',
    comments: [
      { content: 'Me ajudou muito a organizar as entregas do semestre.', username: 'Carla Souza' },
      { content: 'Folhas e divisorias de boa qualidade.', username: 'Bruno Santos' }
    ]
  }
];

const criarProdutoComComentarios = async (prisma: PrismaClient, dados: ProdutoSeed) => {
  await prisma.product.create({
    data: {
      name: dados.name,
      description: dados.description,
      comments: {
        create: dados.comments.map((comentario) => ({
          content: comentario.content,
          user: {
            connect: {
              username: comentario.username
            }
          }
        }))
      }
    }
  });
};

const garantirUsuariosSeed = async (prisma: PrismaClient) => {
  for (const usuario of USUARIOS) {
    const existente = await prisma.user.findUnique({ where: { email: usuario.email } });
    if (existente) {
      continue;
    }

    await prisma.user.create({
      data: {
        username: usuario.username,
        email: usuario.email,
        password: hashSenha(usuario.password)
      }
    });
  }
};

const aplicarComentariosSeed = async (prisma: PrismaClient) => {
  for (const produto of PRODUTOS) {
    const existente = await prisma.product.findFirst({ where: { name: produto.name } });
    if (!existente) {
      continue;
    }

    await prisma.comment.deleteMany({ where: { productId: existente.id } });

    for (const comentario of produto.comments) {
      const autor = await prisma.user.findUnique({ where: { username: comentario.username } });
      if (!autor) {
        continue;
      }

      await prisma.comment.create({
        data: {
          content: comentario.content,
          productId: existente.id,
          userId: autor.id
        }
      });
    }
  }
};

export const seedDatabase = async (prisma: PrismaClient) => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  await prisma.$executeRawUnsafe(
    "DELETE FROM sqlite_sequence WHERE name IN ('User', 'Product', 'Comment')"
  );

  await prisma.user.createMany({
    data: USUARIOS.map((usuario) => ({
      username: usuario.username,
      email: usuario.email,
      password: hashSenha(usuario.password)
    }))
  });

  for (const produto of PRODUTOS) {
    await criarProdutoComComentarios(prisma, produto);
  }
};

export const resetCommentsOnly = async (prisma: PrismaClient) => {
  await garantirUsuariosSeed(prisma);
  await aplicarComentariosSeed(prisma);
};
