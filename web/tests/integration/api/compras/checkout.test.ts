import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import * as compraService from "@/backend/services/compras";
import { POST } from "@/backend/api/compras/checkout/route";
import { setCurrentRole } from "../../mocks/auth";
import { createRequest } from "../../mocks/requests";

vi.mock("@/backend/services/compras", () => ({
  checkoutCompra: vi.fn(),
}));

describe("POST /api/compras/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const payload = {
    produtoIds: [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
    ],
  };

  const compraMock = {
    id: "507f191e810c19729de860ea",
    userId: "11111111-1111-4111-8111-111111111111",
    precoTotal: 99.9,
    createdAt: "2026-04-12T00:00:00.000Z",
    produtos: [],
  };

  const createCheckoutRequest = (body = payload) =>
    createRequest(body, "compras/checkout");

  it("should fail if unauthenticated", async () => {
    setCurrentRole(null);

    const response = await POST(createCheckoutRequest());

    expect(response.status).toBe(401);
  });

  it("should fail with invalid payload", async () => {
    setCurrentRole("USER");

    const response = await POST(
      createCheckoutRequest({
        produtoIds: [],
      })
    );

    expect(response.status).toBe(400);
  });

  it("should create checkout using authenticated user", async () => {
    setCurrentRole("USER");
    (compraService.checkoutCompra as Mock).mockResolvedValue(compraMock);

    const response = await POST(createCheckoutRequest());

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toEqual(compraMock);
    expect(compraService.checkoutCompra).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      payload.produtoIds
    );
  });
});
