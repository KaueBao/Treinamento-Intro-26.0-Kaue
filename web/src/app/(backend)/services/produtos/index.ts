import prisma from "@/backend/services/db";

type ProdutoInput = {
  nome: string;
  descricao: string;
  preco: number;
  categoriaIds?: string[];
};

type ProdutoPatch = Partial<ProdutoInput>;

function categoriasCreate(categoriaIds?: string[]) {
  if (!categoriaIds || categoriaIds.length === 0) {
    return undefined;
  }

  return {
    create: categoriaIds.map((categoriaId) => ({
      categoria: { connect: { id: categoriaId } },
    })),
  };
}

export async function getAllProdutos() {
  return prisma.produto.findMany({
    include: {
      categorias: {
        include: {
          categoria: true,
        },
      },
    },
  });
}

export async function getProdutoById(id: string) {
  return prisma.produto.findUnique({
    where: { id },
    include: {
      categorias: {
        include: {
          categoria: true,
        },
      },
    },
  });
}

export async function createProduto(data: ProdutoInput) {
  return prisma.produto.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      categorias: categoriasCreate(data.categoriaIds),
    },
    include: {
      categorias: {
        include: {
          categoria: true,
        },
      },
    },
  });
}

export async function updateProduto(id: string, data: ProdutoPatch) {
  return prisma.produto.update({
    where: { id },
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      categorias: data.categoriaIds
        ? {
            deleteMany: {},
            ...categoriasCreate(data.categoriaIds),
          }
        : undefined,
    },
    include: {
      categorias: {
        include: {
          categoria: true,
        },
      },
    },
  });
}

export async function deleteProduto(id: string) {
  return prisma.produto.delete({
    where: { id },
  });
}
