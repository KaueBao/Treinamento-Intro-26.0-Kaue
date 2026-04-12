import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

vi.mock("@/backend/services/db", () => ({
  default: {
    produto: {
      findMany: vi.fn(),
    },
    compra: {
      create: vi.fn(),
    },
  },
}));

import prisma from "@/backend/services/db";
import { checkoutCompra } from "@/backend/services/compras";

describe("compras service checkoutCompra", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockedPrisma = prisma as unknown as {
    produto: {
      findMany: Mock;
    };
    compra: {
      create: Mock;
    };
  };

  it("should associate user and calculate precoTotal automatically", async () => {
    const produtoIds = [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
    ];

    mockedPrisma.produto.findMany.mockResolvedValue([
      { id: produtoIds[0], preco: 49.9 },
      { id: produtoIds[1], preco: 50.1 },
    ]);

    mockedPrisma.compra.create.mockResolvedValue({
      id: "507f191e810c19729de860ea",
      userId: "11111111-1111-1111-1111-111111111111",
      precoTotal: 100,
    });

    await checkoutCompra("11111111-1111-1111-1111-111111111111", produtoIds);

    expect(mockedPrisma.produto.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: produtoIds,
        },
      },
    });

    expect(mockedPrisma.compra.create).toHaveBeenCalledWith({
      data: {
        user: {
          connect: {
            id: "11111111-1111-1111-1111-111111111111",
          },
        },
        precoTotal: 100,
        produtos: {
          create: [
            {
              produto: {
                connect: {
                  id: produtoIds[0],
                },
              },
            },
            {
              produto: {
                connect: {
                  id: produtoIds[1],
                },
              },
            },
          ],
        },
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
  });

  it("should fail when one or more products are missing", async () => {
    mockedPrisma.produto.findMany.mockResolvedValue([
      { id: "507f1f77bcf86cd799439011", preco: 49.9 },
    ]);

    await expect(
      checkoutCompra("11111111-1111-1111-1111-111111111111", [
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012",
      ])
    ).rejects.toThrow("Um ou mais produtos nao foram encontrados");

    expect(mockedPrisma.compra.create).not.toHaveBeenCalled();
  });
});
