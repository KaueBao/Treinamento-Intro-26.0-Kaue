import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { NextRequest } from "next/server";

import * as compraService from "@/backend/services/compras";
import { PATCH } from "@/backend/api/compras/[id]/status/route";
import { setCurrentRole } from "../../../mocks/auth";
import { returnParams } from "../../../mocks/requests";

vi.mock("@/backend/services/compras", () => ({
  getCompraById: vi.fn(),
  updateCompraStatus: vi.fn(),
}));

describe("PATCH /api/compras/:id/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole("USER");
  });

  const compraId = "507f191e810c19729de860ea";
  const payload = { status: "shipped" };

  const createPatchRequest = (body: unknown = payload) =>
    new NextRequest("http://localhost:3000/api/compras/507f191e810c19729de860ea/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

  it("should fail with invalid id", async () => {
    const response = await PATCH(createPatchRequest(), returnParams({ id: "invalid-id" }));

    expect(response.status).toBe(400);
    expect(compraService.getCompraById).not.toHaveBeenCalled();
    expect(compraService.updateCompraStatus).not.toHaveBeenCalled();
  });

  it("should fail with invalid status payload", async () => {
    const response = await PATCH(
      createPatchRequest({ status: "processing" }),
      returnParams({ id: compraId })
    );

    expect(response.status).toBe(400);
    expect(compraService.getCompraById).not.toHaveBeenCalled();
    expect(compraService.updateCompraStatus).not.toHaveBeenCalled();
  });

  it("should fail when compra is not found", async () => {
    (compraService.getCompraById as Mock).mockResolvedValue(null);

    const response = await PATCH(createPatchRequest(), returnParams({ id: compraId }));

    expect(response.status).toBe(404);
    expect(compraService.getCompraById).toHaveBeenCalledWith(compraId);
    expect(compraService.updateCompraStatus).not.toHaveBeenCalled();
  });

  it("should update compra status", async () => {
    const compraMock = {
      id: compraId,
      status: "pending",
    };

    const updatedCompraMock = {
      ...compraMock,
      status: payload.status,
    };

    (compraService.getCompraById as Mock).mockResolvedValue(compraMock);
    (compraService.updateCompraStatus as Mock).mockResolvedValue(updatedCompraMock);

    const response = await PATCH(createPatchRequest(), returnParams({ id: compraId }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(updatedCompraMock);
    expect(compraService.updateCompraStatus).toHaveBeenCalledWith(compraId, payload.status);
  });

  it("should fail with malformed json", async () => {
    const malformedRequest = new NextRequest(
      "http://localhost:3000/api/compras/507f191e810c19729de860ea/status",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{",
      }
    );

    const response = await PATCH(malformedRequest, returnParams({ id: compraId }));

    expect(response.status).toBe(400);
    expect(compraService.getCompraById).not.toHaveBeenCalled();
    expect(compraService.updateCompraStatus).not.toHaveBeenCalled();
  });
});
