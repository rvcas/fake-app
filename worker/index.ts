import { handleRegisterOptions, handleRegisterVerify } from "./routes/register";
import { handleAuthOptions, handleAuthVerify } from "./routes/authenticate";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST") {
      switch (url.pathname) {
        case "/api/register/options":
          return handleRegisterOptions(request, env);
        case "/api/register/verify":
          return handleRegisterVerify(request, env);
        case "/api/auth/options":
          return handleAuthOptions(request, env);
        case "/api/auth/verify":
          return handleAuthVerify(request, env);
      }
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
