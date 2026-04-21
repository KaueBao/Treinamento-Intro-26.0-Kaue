import { NextRequest, NextResponse } from "next/server";

import { objectIdSchema, patchProdutoSchema } from "@/schemas";
import { deleteProduto, getProdutoById, updateProduto } from "@/backend/services/produtos";
import { returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from "@/utils/api";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authMiddleware(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    const produto = await getProdutoById(id);

    if (!produto) {
      return NextResponse.json(toErrorMessage("Produto nao encontrado"), { status: 404 });
    }

    return NextResponse.json(produto, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authMiddleware(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    const body = await validBody(request);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = patchProdutoSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const produto = await updateProduto(id, validationResult.data);
    return NextResponse.json(produto, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authMiddleware(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    await deleteProduto(id);
    return NextResponse.json({ message: "Produto removido com sucesso" }, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
