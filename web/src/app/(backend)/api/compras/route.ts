import { NextRequest, NextResponse } from "next/server";

import { createCompraSchema } from "@/backend/schemas";
import { createCompra, getAllCompras } from "@/backend/services/compras";
import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";

export async function GET() {
  try {
    const compras = await getAllCompras();
    return NextResponse.json(compras, { status: 200 });
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

    const validationResult = createCompraSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const compra = await createCompra(validationResult.data);
    return NextResponse.json(compra, { status: 201 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
