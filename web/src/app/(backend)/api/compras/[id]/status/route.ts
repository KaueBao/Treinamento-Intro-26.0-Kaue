import { NextRequest, NextResponse } from "next/server";

import { objectIdSchema, patchCompraStatusSchema } from "@/schemas";
import { getCompraById, updateCompraStatus } from "@/backend/services/compras";
import { returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from "@/utils/api";
import { authMiddleware } from "@/middleware/auth";
import { sendEmail } from "@/utils/email/sendEmail";

const statusEmailConfig: Partial<Record<string, { subject: string; body: string }>> = {
  paid: {
    subject: "Pagamento confirmado",
    body: "Seu pagamento foi confirmado com sucesso. Obrigado pela sua compra!",
  },
  shipped: {
    subject: "Seu pedido foi enviado",
    body: "Seu pedido foi enviado e está a caminho. Em breve você o receberá!",
  },
  delivered: {
    subject: "Seu pedido foi entregue com sucesso",
    body: "Seu pedido foi entregue. Esperamos que aproveite!",
  },
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authMiddleware(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    const idValidation = objectIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(toErrorMessage("ID invalido"), { status: 400 });
    }

    const body = await validBody(request);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = patchCompraStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const compra = await getCompraById(id);

    if (!compra) {
      return NextResponse.json(toErrorMessage("Compra nao encontrada"), { status: 404 });
    }

    const updatedCompra = await updateCompraStatus(id, validationResult.data.status);

    const emailConfig = statusEmailConfig[validationResult.data.status];
    if (emailConfig && compra.user?.email) {
      await sendEmail(compra.user.email, emailConfig.subject, emailConfig.body);
    }

    return NextResponse.json(updatedCompra, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
