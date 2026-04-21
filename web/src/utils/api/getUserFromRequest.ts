import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { toErrorMessage } from "./toErrorMessage";

export async function getUserFromRequest(request: NextRequest) {
  const session = await auth.api.getSession(request);

  const userWithoutRole = session?.user;
  const role = session?.role;

  if (!session || !userWithoutRole || !role) {
    return NextResponse.json(toErrorMessage("Não autenticado"), { status: 401 });
  }

  const user = {
    ...userWithoutRole,
    role
  }
 
  return user;
}