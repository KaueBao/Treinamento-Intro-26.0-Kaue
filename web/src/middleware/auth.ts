import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { toErrorMessage } from "@/utils/api";
import type { Role } from "@/generated/prisma";

export async function authMiddleware(request: NextRequest) {
  const session = await auth.api.getSession(request);

  if (!session?.user || !session?.role) {
    return NextResponse.json(
      toErrorMessage("Usuário não autenticado"),
      { status: 401 }
    );
  }

  return { ...session.user, role: session.role as Role };
}
