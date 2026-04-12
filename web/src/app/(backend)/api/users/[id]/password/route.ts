import { NextRequest, NextResponse } from "next/server";

import { blockForbiddenRequests, getUserFromRequest, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { AllowedRoutes } from "@/types";
import { idSchema, updatePasswordSchema } from "@/schemas";
import { auth } from "@/auth";
import { toErrorMessage } from "@/utils/api/toErrorMessage";

const allowedRoles: AllowedRoutes = {
  PATCH: ['SUPER_ADMIN', 'ADMIN', 'USER'],
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await blockForbiddenRequests(request, allowedRoles.PATCH);
    if (forbidden) {
      return forbidden;
    }

    const userFromRequest = await getUserFromRequest(request);

    if (userFromRequest instanceof NextResponse) {
      return userFromRequest;
    }

    const { id } = await params;

    const idValidationResult = idSchema.safeParse(id);

    if (!idValidationResult.success) {
      return NextResponse.json(
        toErrorMessage('ID Inválido'),
        { status: 400 }
      )
    }

    if (id !== userFromRequest.id) {
      return NextResponse.json(
        toErrorMessage("A senha só pode ser alterada pelo próprio usuário"),
        { status: 403 }
      );
    }

    const body = await validBody(request);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = updatePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }
    
    const user = await auth.api.changePassword({ body: {
      newPassword: validationResult.data.newPassword,
      currentPassword: validationResult.data.currentPassword
    }})
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);
  }
}