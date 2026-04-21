import prisma from "@/backend/services/db";
import type { CompraStatus } from "@/generated/prisma";

type CompraInput = {
  userId: string;
  produtoIds: string[];
};

type CompraPatch = Partial<CompraInput>;

async function calcularPrecoTotal(produtoIds: string[]) {
  const produtos = await prisma.produto.findMany({
    where: {
      id: {
        in: produtoIds,
      },
    },
  });

  if (produtos.length !== produtoIds.length) {
    throw new Error("Um ou mais produtos nao foram encontrados");
  }

  return produtos.reduce((acc, produto) => acc + produto.preco, 0);
}

function produtosCreate(produtoIds: string[]) {
  return {
    create: produtoIds.map((produtoId) => ({
      produto: { connect: { id: produtoId } },
    })),
  };
}

export async function getAllCompras() {
  return prisma.compra.findMany({
    include: {
      user: true,
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });
}

export async function getCompraById(id: string) {
  return prisma.compra.findUnique({
    where: { id },
    include: {
      user: true,
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });
}

export async function createCompra(data: CompraInput) {
  const precoTotal = await calcularPrecoTotal(data.produtoIds);

  return prisma.compra.create({
    data: {
      user: {
        connect: { id: data.userId },
      },
      precoTotal,
      produtos: produtosCreate(data.produtoIds),
    },
    include: {
      user: true,
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });
}

export async function updateCompra(id: string, data: CompraPatch) {
  const precoTotal = data.produtoIds
    ? await calcularPrecoTotal(data.produtoIds)
    : undefined;

  return prisma.compra.update({
    where: { id },
    data: {
      user: data.userId
        ? {
            connect: { id: data.userId },
          }
        : undefined,
      precoTotal,
      produtos: data.produtoIds
        ? {
            deleteMany: {},
            ...produtosCreate(data.produtoIds),
          }
        : undefined,
    },
    include: {
      user: true,
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });
}

export async function updateCompraStatus(id: string, status: CompraStatus) {
  return prisma.compra.update({
    where: { id },
    data: {
      status,
    },
    include: {
      user: true,
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });
}

export async function deleteCompra(id: string) {
  return prisma.compra.delete({
    where: { id },
  });
}

export async function checkoutCompra(userId: string, produtoIds: string[]) {
  return createCompra({
    userId,
    produtoIds,
  });
}

export async function getUserCompraStats(userId: string) {
  const compras = await prisma.compra.findMany({
    where: { userId },
    include: {
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });

  const totalGasto = compras.reduce((acc, compra) => acc + compra.precoTotal, 0);
  const totalCompras = compras.length;

  const frequenciaProdutos: Record<string, { nome: string; quantidade: number }> = {};

  for (const compra of compras) {
    for (const item of compra.produtos) {
      const produtoId = item.produto.id;

      if (!frequenciaProdutos[produtoId]) {
        frequenciaProdutos[produtoId] = {
          nome: item.produto.nome,
          quantidade: 0,
        };
      }

      frequenciaProdutos[produtoId].quantidade += 1;
    }
  }

  let produtoMaisComprado: { id: string; nome: string; quantidade: number } | null = null;

  for (const [id, dados] of Object.entries(frequenciaProdutos)) {
    if (!produtoMaisComprado || dados.quantidade > produtoMaisComprado.quantidade) {
      produtoMaisComprado = {
        id,
        nome: dados.nome,
        quantidade: dados.quantidade,
      };
    }
  }

  return {
    totalGasto,
    totalCompras,
    produtoMaisComprado,
  };
}
