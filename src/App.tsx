import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { FakeDapp } from "@/components/fake-dapp";

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Header />
      <div className="min-h-svh bg-background pt-14">
        <FakeDapp />
      </div>
    </ThemeProvider>
  );
}
