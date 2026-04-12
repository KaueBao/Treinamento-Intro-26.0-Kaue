import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { NextRequest } from "next/server";

import * as compraService from "@/backend/services/compras";
import { GET } from "@/backend/api/users/[id]/stats/route";
import { returnParams } from "../../../../mocks/requests";
import { setCurrentRole } from "../../../../mocks/auth";

vi.mock("@/backend/services/compras", () => ({
  getUserCompraStats: vi.fn(),
}));

describe("GET /api/users/:id/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createStatsRequest = () =>
    new NextRequest("http://localhost:3000/api/users/test-user-id/stats", {
      method: "GET",
    });

  it("should return 401 when user is not authenticated", async () => {
    const response = await GET(createStatsRequest(), returnParams({ id: "test-user-id" }));
    expect(response.status).toBe(401);
  });

  it("should return 403 when USER requests stats from another user", async () => {
    setCurrentRole("USER");
    const response = await GET(createStatsRequest(), returnParams({ id: "other-user-id" }));
    expect(response.status).toBe(403);
  });

  it("should return stats when USER requests own stats", async () => {
    setCurrentRole("USER");
    const statsMock = {
      totalGasto: 299.8,
      totalCompras: 2,
      produtoMaisComprado: {
        id: "64f1f77bcf86cd7994390111",
        nome: "Produto A",
        quantidade: 2,
      },
    };
    (compraService.getUserCompraStats as Mock).mockResolvedValue(statsMock);

    const response = await GET(createStatsRequest(), returnParams({ id: "test-user-id" }));

    expect(response.status).toBe(200);
    expect(compraService.getUserCompraStats).toHaveBeenCalledWith("test-user-id");
    expect(await response.json()).toEqual(statsMock);
  });

  it("should allow ADMIN to request stats from another user", async () => {
    setCurrentRole("ADMIN");
    const statsMock = {
      totalGasto: 100,
      totalCompras: 1,
      produtoMaisComprado: null,
    };
    (compraService.getUserCompraStats as Mock).mockResolvedValue(statsMock);

    const response = await GET(createStatsRequest(), returnParams({ id: "another-user-id" }));

    expect(response.status).toBe(200);
    expect(compraService.getUserCompraStats).toHaveBeenCalledWith("another-user-id");
    expect(await response.json()).toEqual(statsMock);
  });
});
