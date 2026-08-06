import { Navbar } from '@/components/landing/navbar';
import { GradeExplorer } from '@/components/landing/grade-explorer';
import { FoundingFamilies } from '@/components/landing/founding-families';
import { InteractiveDemo } from '@/components/landing/interactive-demo';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';

// Server component: only the grade-interactive trio (inside GradeExplorer) runs
// on the client. Everything below is server-rendered with no client JS.
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <GradeExplorer />
      <InteractiveDemo />
      <FoundingFamilies />
      <Pricing />
      <Footer />
    </main>
  );
}
