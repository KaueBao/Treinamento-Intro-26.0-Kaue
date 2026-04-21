import { NextRequest, NextResponse } from "next/server";

import { checkoutCompraSchema } from "@/schemas";
import { checkoutCompra } from "@/backend/services/compras";
import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { authMiddleware } from "@/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const userFromRequest = await authMiddleware(request);

    if (userFromRequest instanceof NextResponse) {
      return userFromRequest;
    }

    const body = await validBody(request);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = checkoutCompraSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const compra = await checkoutCompra(userFromRequest.id, validationResult.data.produtoIds);
    return NextResponse.json(compra, { status: 201 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
