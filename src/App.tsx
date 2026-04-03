import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { PasskeyDemo } from "@/components/passkey-demo";

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Header />
      <div className="min-h-svh bg-background pt-14">
        <PasskeyDemo />
      </div>
    </ThemeProvider>
  );
}
