import { NextRequest, NextResponse } from "next/server";

import { checkoutCompraSchema } from "@/backend/schemas";
import { checkoutCompra } from "@/backend/services/compras";
import { getUserFromRequest, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";

export async function POST(request: NextRequest) {
  try {
    const userFromRequest = await getUserFromRequest(request);

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
