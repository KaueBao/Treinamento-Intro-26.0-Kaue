import { NextRequest, NextResponse } from "next/server";

import { createProdutoSchema } from "@/backend/schemas";
import { createProduto, getAllProdutos } from "@/backend/services/produtos";
import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";

export async function GET() {
  try {
    const produtos = await getAllProdutos();
    return NextResponse.json(produtos, { status: 200 });
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

    const validationResult = createProdutoSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const produto = await createProduto(validationResult.data);
    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
