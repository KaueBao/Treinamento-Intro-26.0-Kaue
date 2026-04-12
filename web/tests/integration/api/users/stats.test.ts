import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { NextRequest } from "next/server";

import * as compraService from "@/backend/services/compras";
import { GET } from "@/backend/api/users/[id]/stats/route";
import { returnParams } from "../../mocks/requests";
import { setCurrentRole } from "../../mocks/auth";

vi.mock("@/backend/services/compras", () => ({
  getUserCompraStats: vi.fn(),
}));

describe("GET /api/users/:id/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const request = new NextRequest("http://localhost:3000/api/users/stats", {
    method: "GET",
  });

  const validUserId = "11111111-1111-4111-8111-111111111111";

  it("should fail if unauthenticated", async () => {
    setCurrentRole(null);

    const response = await GET(request, returnParams({ id: validUserId }));

    expect(response.status).toBe(401);
  });

  it("should fail with invalid user id", async () => {
    setCurrentRole("ADMIN");

    const response = await GET(request, returnParams({ id: "invalid-id" }));

    expect(response.status).toBe(400);
  });

  it("should fail when USER tries to access another user stats", async () => {
    setCurrentRole("USER");

    const response = await GET(
      request,
      returnParams({ id: "22222222-2222-4222-8222-222222222222" })
    );

    expect(response.status).toBe(403);
  });

  it("should return stats for authenticated USER own id", async () => {
    setCurrentRole("USER");
    const statsMock = {
      totalGasto: 149.9,
      totalCompras: 3,
      produtoMaisComprado: {
        id: "507f1f77bcf86cd799439011",
        nome: "Produto X",
        quantidade: 2,
      },
    };

    (compraService.getUserCompraStats as Mock).mockResolvedValue(statsMock);

    const response = await GET(request, returnParams({ id: validUserId }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(
      expect.objectContaining({
        totalGasto: statsMock.totalGasto,
        totalCompras: statsMock.totalCompras,
        produtoMaisComprado: statsMock.produtoMaisComprado,
      })
    );
    expect(compraService.getUserCompraStats).toHaveBeenCalledWith(validUserId);
  });

  it("should allow ADMIN to access any user stats", async () => {
    setCurrentRole("ADMIN");
    const anotherUserId = "22222222-2222-4222-8222-222222222222";
    const statsMock = {
      totalGasto: 80,
      totalCompras: 1,
      produtoMaisComprado: null,
    };

    (compraService.getUserCompraStats as Mock).mockResolvedValue(statsMock);

    const response = await GET(request, returnParams({ id: anotherUserId }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(
      expect.objectContaining({
        totalGasto: statsMock.totalGasto,
        totalCompras: statsMock.totalCompras,
        produtoMaisComprado: statsMock.produtoMaisComprado,
      })
    );
    expect(compraService.getUserCompraStats).toHaveBeenCalledWith(anotherUserId);
  });
});
