import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { toErrorMessage } from "./toErrorMessage";

type ErrorWithStatus = {
  message?: string;
  status?: number;
  code?: string;
  name?: string;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(toErrorMessage(message), { status });
}

function getValidationMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Dados invalidos";
}

function isAuthError(error: unknown): error is ErrorWithStatus {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as ErrorWithStatus;

  if (candidate.status === 401 || candidate.status === 403) {
    return true;
  }

  if (candidate.code === "UNAUTHORIZED" || candidate.code === "FORBIDDEN") {
    return true;
  }

  const message = candidate.message?.toLowerCase() ?? "";
  const name = candidate.name?.toLowerCase() ?? "";

  return (
    name.includes("auth") ||
    message.includes("nao autenticado") ||
    message.includes("não autenticado") ||
    message.includes("nao autorizado") ||
    message.includes("não autorizado") ||
    message.includes("acesso negado") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  );
}

function getAuthStatus(error: ErrorWithStatus) {
  if (error.status === 401 || error.status === 403) {
    return error.status;
  }

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("acesso negado") || message.includes("forbidden")) {
    return 403;
  }

  return 401;
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return errorResponse(getValidationMessage(error), 400);
  }

  if (isAuthError(error)) {
    return errorResponse(error.message ?? "Nao autenticado", getAuthStatus(error));
  }

  return errorResponse("Erro Interno do Servidor", 500);
}

export function returnInvalidDataErrors(error: ZodError) {
  return handleError(error);
}

export function zodErrorHandler(error: unknown) {
  return handleError(error);
}