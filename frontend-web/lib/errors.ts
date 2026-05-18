import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  data?: {
    errors?: Record<string, string[]>;
  };
}

export function extractApiErrors(error: unknown, fallback: string): string[] {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const validationErrors = error.response?.data?.errors || error.response?.data?.data?.errors;

    if (validationErrors) {
      return Object.entries(validationErrors).flatMap(([field, messages]) =>
        messages.map((message) => normalizeValidationMessage(field, message)),
      );
    }

    if (error.response?.data?.message) {
      return [error.response.data.message];
    }
  }

  return [fallback];
}

function normalizeValidationMessage(field: string, message: string): string {
  if (field === "email" && /taken/i.test(message)) {
    return "Email sudah digunakan. Silakan login atau gunakan email lain.";
  }

  if (field === "password" && /confirmation/i.test(message)) {
    return "Konfirmasi password tidak sama.";
  }

  return message;
}
