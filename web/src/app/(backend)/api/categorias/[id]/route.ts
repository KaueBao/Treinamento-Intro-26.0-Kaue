import { NextRequest, NextResponse } from "next/server";

import { objectIdSchema, patchCategoriaSchema } from "@/schemas";
import { deleteCategoria, getCategoriaById, updateCategoria } from "@/backend/services/categorias";
import { returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from "@/utils/api";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    const categoria = await getCategoriaById(id);

    if (!categoria) {
      return NextResponse.json(toErrorMessage("Categoria nao encontrada"), { status: 404 });
    }

    return NextResponse.json(categoria, { status: 200 });
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

    const validationResult = patchCategoriaSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const categoria = await updateCategoria(id, validationResult.data);
    return NextResponse.json(categoria, { status: 200 });
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

    await deleteCategoria(id);
    return NextResponse.json({ message: "Categoria removida com sucesso" }, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
