import { NextRequest, NextResponse } from "next/server";

import { getUserCompraStats } from "@/backend/services/compras";
import { getUserFromRequest, toErrorMessage, zodErrorHandler } from "@/utils/api";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userFromRequest = await getUserFromRequest(request);

    if (userFromRequest instanceof NextResponse) {
      return userFromRequest;
    }

    const { id } = await params;

    if (userFromRequest.role === "USER" && userFromRequest.id !== id) {
      return NextResponse.json(toErrorMessage("Acesso negado"), { status: 403 });
    }

    const stats = await getUserCompraStats(id);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return zodErrorHandler(error);
  }
}
