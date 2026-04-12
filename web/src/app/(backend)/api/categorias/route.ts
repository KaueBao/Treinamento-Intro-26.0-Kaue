import { NextRequest, NextResponse } from "next/server";

import { createCategoriaSchema } from "@/schemas";
import { createCategoria, getAllCategorias } from "@/backend/services/categorias";
import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";

export async function GET() {
  try {
    const categorias = await getAllCategorias();
    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validBody(request);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = createCategoriaSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const categoria = await createCategoria(validationResult.data);
    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
