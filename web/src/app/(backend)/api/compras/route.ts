import { NextRequest, NextResponse } from "next/server";

import { createCompraSchema } from "@/schemas";
import { createCompra, getAllCompras } from "@/backend/services/compras";
import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { authMiddleware } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (user instanceof NextResponse) return user;

    const compras = await getAllCompras();
    return NextResponse.json(compras, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (user instanceof NextResponse) return user;

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
