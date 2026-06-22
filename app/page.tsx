import { SiteNav } from "@/components/features/landing/site-nav";
import { Hero } from "@/components/features/landing/hero";
import { FeatureGrid } from "@/components/features/landing/feature-grid";
import { HowItWorks } from "@/components/features/landing/how-it-works";
import { SiteFooter } from "@/components/features/landing/site-footer";

export default function Home(): React.JSX.Element {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  );
}
