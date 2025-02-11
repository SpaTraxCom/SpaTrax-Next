import Hero from "@/app/(landing)/components/hero";
import Features from "@/app/(landing)/components/features";
import Footer from "@/app/(landing)/components/footer";

export default async function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
