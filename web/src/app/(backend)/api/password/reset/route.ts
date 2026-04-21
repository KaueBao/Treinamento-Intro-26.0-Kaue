import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { resetPasswordSchema } from "@/schemas";
import { returnInvalidDataErrors, validBody } from "@/utils/api";
import { toErrorMessage } from "@/utils/api/toErrorMessage";

export async function POST(req: NextRequest) {
  try {
    const body = await validBody(req);

    if (body instanceof NextResponse) {
      return body;
    }

    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const { token, newPassword } = validationResult.data;

    const res = await auth.api.resetPassword({
      body: { token, newPassword },
    });
    
    return NextResponse.json(res);
  } catch {
    return NextResponse.json(toErrorMessage("Reset failed"), { status: 400 });
  }
}
