import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { NextRequest } from "next/server";

import * as compraService from "@/backend/services/compras";
import { POST } from "@/backend/api/compras/checkout/route";
import { setCurrentRole } from "../../../mocks/auth";

vi.mock("@/backend/services/compras", () => ({
  checkoutCompra: vi.fn(),
}));

describe("POST /api/compras/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createCheckoutRequest = (body: unknown) =>
    new NextRequest("http://localhost:3000/api/compras/checkout", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

  it("should return 401 when user is not authenticated", async () => {
    const response = await POST(
      createCheckoutRequest({ produtoIds: ["64f1f77bcf86cd7994390111"] }),
    );

    expect(response.status).toBe(401);
  });

  it("should checkout with authenticated user and calculate by selected products", async () => {
    setCurrentRole("USER");

    const checkoutResponseMock = {
      id: "compra-id",
      userId: "test-user-id",
      precoTotal: 149.9,
      produtos: [],
    };

    (compraService.checkoutCompra as Mock).mockResolvedValue(checkoutResponseMock);

    const produtoIds = ["64f1f77bcf86cd7994390111", "64f1f77bcf86cd7994390112"];
    const response = await POST(createCheckoutRequest({ produtoIds }));

    expect(response.status).toBe(201);
    expect(compraService.checkoutCompra).toHaveBeenCalledWith("test-user-id", produtoIds);
    expect(await response.json()).toEqual(checkoutResponseMock);
  });
});
