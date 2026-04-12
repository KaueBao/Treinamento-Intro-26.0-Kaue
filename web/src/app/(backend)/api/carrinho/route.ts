import { NextRequest, NextResponse } from "next/server";

import { addCarrinhoItemSchema, removeCarrinhoItemSchema } from "@/schemas";
import { addItemToCarrinho, getCarrinhoByUserId, removeItemFromCarrinho } from "@/backend/services/carrinho";
import { getUserFromRequest, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";

export async function GET(request: NextRequest) {
  try {
    const userFromRequest = await getUserFromRequest(request);

    if (userFromRequest instanceof NextResponse) {
      return userFromRequest;
    }

    const carrinho = await getCarrinhoByUserId(userFromRequest.id);
    return NextResponse.json(carrinho, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

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

    const validationResult = addCarrinhoItemSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const carrinho = await addItemToCarrinho(
      userFromRequest.id,
      validationResult.data.produtoId,
      validationResult.data.quantidade ?? 1
    );

    return NextResponse.json(carrinho, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userFromRequest = await getUserFromRequest(request);

    if (userFromRequest instanceof NextResponse) {
      return userFromRequest;
    }

    const body = await validBody(request);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = removeCarrinhoItemSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const carrinho = await removeItemFromCarrinho(
      userFromRequest.id,
      validationResult.data.produtoId,
      validationResult.data.quantidade ?? 1
    );

    return NextResponse.json(carrinho, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
