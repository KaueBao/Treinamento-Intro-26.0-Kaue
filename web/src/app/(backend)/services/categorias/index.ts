import prisma from "@/backend/services/db";

type CategoriaInput = {
  nome: string;
};

type CategoriaPatch = Partial<CategoriaInput>;

export async function getAllCategorias() {
  return prisma.categoria.findMany({
    include: {
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });
}

export async function getCategoriaById(id: string) {
  return prisma.categoria.findUnique({
    where: { id },
    include: {
      produtos: {
        include: {
          produto: true,
        },
      },
    },
  });
}

export async function createCategoria(data: CategoriaInput) {
  return prisma.categoria.create({
    data,
  });
}

export async function updateCategoria(id: string, data: CategoriaPatch) {
  return prisma.categoria.update({
    where: { id },
    data,
  });
}

export async function deleteCategoria(id: string) {
  return prisma.categoria.delete({
    where: { id },
  });
}
