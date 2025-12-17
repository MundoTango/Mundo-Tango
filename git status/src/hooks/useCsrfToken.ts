import { useState, useEffect } from "react";

export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (token) {
      setCsrfToken(token);
    } else {
      fetch("/api/csrf-token")
        .then((res) => res.json())
        .then((data) => setCsrfToken(data.csrfToken))
        .catch((error) => console.error("Failed to fetch CSRF token:", error));
    }
  }, []);

  return csrfToken;
}

export function getCsrfTokenFromCookie(): string {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
  return token || "";
}
