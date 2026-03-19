import { NextRequest, NextResponse } from "next/server";

import { objectIdSchema, patchCompraSchema } from "@/backend/schemas";
import { deleteCompra, getCompraById, updateCompra } from "@/backend/services/compras";
import { returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from "@/utils/api";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    const compra = await getCompraById(id);

    if (!compra) {
      return NextResponse.json(toErrorMessage("Compra nao encontrada"), { status: 404 });
    }

    return NextResponse.json(compra, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    const body = await validBody(request);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = patchCompraSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const compra = await updateCompra(id, validationResult.data);
    return NextResponse.json(compra, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    await deleteCompra(id);
    return NextResponse.json({ message: "Compra removida com sucesso" }, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
