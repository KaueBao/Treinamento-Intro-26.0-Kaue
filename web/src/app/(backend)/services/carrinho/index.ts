import prisma from "@/backend/services/db";

type CarrinhoResumo = {
  id: string;
  itens: Array<{
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
    subtotal: number;
  }>;
  totalItens: number;
  totalPreco: number;
};

async function getOrCreateCarrinho(userId: string) {
  const existente = await prisma.carrinho.findUnique({
    where: { userId },
  });

  if (existente) {
    return existente;
  }

  return prisma.carrinho.create({
    data: {
      user: {
        connect: { id: userId },
      },
    },
  });
}

async function montarResumoCarrinho(userId: string): Promise<CarrinhoResumo> {
  const carrinho = await prisma.carrinho.findUnique({
    where: { userId },
    include: {
      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  if (!carrinho) {
    return {
      id: "",
      itens: [],
      totalItens: 0,
      totalPreco: 0,
    };
  }

  const itens = carrinho.itens.map((item) => ({
    produtoId: item.produtoId,
    nome: item.produto.nome,
    preco: item.produto.preco,
    quantidade: item.quantidade,
    subtotal: item.produto.preco * item.quantidade,
  }));

  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);
  const totalPreco = itens.reduce((acc, item) => acc + item.subtotal, 0);

  return {
    id: carrinho.id,
    itens,
    totalItens,
    totalPreco,
  };
}

export async function getCarrinhoByUserId(userId: string) {
  await getOrCreateCarrinho(userId);
  return montarResumoCarrinho(userId);
}

export async function addItemToCarrinho(userId: string, produtoId: string, quantidade = 1) {
  const carrinho = await getOrCreateCarrinho(userId);

  const produtoExiste = await prisma.produto.findUnique({
    where: { id: produtoId },
    select: { id: true },
  });

  if (!produtoExiste) {
    throw new Error("Produto nao encontrado");
  }

  const item = await prisma.carrinhoItem.findUnique({
    where: {
      carrinhoId_produtoId: {
        carrinhoId: carrinho.id,
        produtoId,
      },
    },
  });

  if (!item) {
    await prisma.carrinhoItem.create({
      data: {
        carrinho: { connect: { id: carrinho.id } },
        produto: { connect: { id: produtoId } },
        quantidade,
      },
    });
  } else {
    await prisma.carrinhoItem.update({
      where: { id: item.id },
      data: {
        quantidade: item.quantidade + quantidade,
      },
    });
  }

  return montarResumoCarrinho(userId);
}

export async function removeItemFromCarrinho(userId: string, produtoId: string, quantidade = 1) {
  const carrinho = await getOrCreateCarrinho(userId);

  const item = await prisma.carrinhoItem.findUnique({
    where: {
      carrinhoId_produtoId: {
        carrinhoId: carrinho.id,
        produtoId,
      },
    },
  });

  if (!item) {
    return montarResumoCarrinho(userId);
  }

  const proximaQuantidade = item.quantidade - quantidade;

  if (proximaQuantidade <= 0) {
    await prisma.carrinhoItem.delete({
      where: { id: item.id },
    });
  } else {
    await prisma.carrinhoItem.update({
      where: { id: item.id },
      data: { quantidade: proximaQuantidade },
    });
  }

  return montarResumoCarrinho(userId);
}
