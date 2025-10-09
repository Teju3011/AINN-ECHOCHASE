import { EcoChaseSimulation } from '@/components/simulation/ecochase-simulation';
import { ThemeProvider } from '@/components/theme-provider';

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <EcoChaseSimulation />
    </ThemeProvider>
  );
}
