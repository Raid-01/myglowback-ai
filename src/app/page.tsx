import Link from 'next/link';
import { ConcernMatcherDemo } from '@/components/ConcernMatcherDemo';
import { PricingCalculator } from '@/components/PricingCalculator';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-medium text-sage-800">
          MyGlowBack<span className="text-honey-500">.AI</span>
        </span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-clinical-text hover:text-sage-700">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Start Free Trial</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-sage-600">
            For clinics &amp; cosmetic merchants
          </p>
          <h1 className="font-display text-4xl font-medium leading-[1.1] text-clinical-text sm:text-5xl">
            Turn a skin consult into a protocol, <em className="not-italic text-sage-600">in minutes.</em>
          </h1>
          <p className="mt-5 max-w-md text-base text-clinical-muted">
            MyGlowBack.AI matches every patient to an acne, hyperpigmentation, sun damage, or
            anti-aging routine — pulled straight from your own product catalog and in-stock
            inventory. No general skincare noise, just the four concerns your staff see every day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <a href="#pricing">
              <Button variant="secondary" size="lg">
                See pricing
              </Button>
            </a>
          </div>
        </div>

        <ConcernMatcherDemo />
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium text-clinical-text">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Assess',
              body: 'Staff run a short intake — skin type, the concern, allergies, goals.',
            },
            {
              title: 'Match',
              body: 'The engine matches the patient to a 90-day AM/PM routine and your in-stock products.',
            },
            {
              title: 'Follow up',
              body: 'A follow-up date is scheduled automatically, with upsells surfaced for staff.',
            },
          ].map((step, i) => (
            <div key={step.title} className="rounded-card border border-clinical-border bg-white p-6">
              <span className="font-display text-3xl text-sage-300">0{i + 1}</span>
              <h3 className="mt-2 text-base font-semibold text-clinical-text">{step.title}</h3>
              <p className="mt-1 text-sm text-clinical-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-2xl font-medium text-clinical-text">
            One price per location
          </h2>
          <p className="mt-2 text-sm text-clinical-muted">
            No per-staff fees. Add as many staff accounts as your location needs.
          </p>
        </div>
        <div className="mt-10">
          <PricingCalculator />
        </div>
      </section>

      <footer className="border-t border-clinical-border py-8 text-center text-xs text-clinical-muted">
        © {new Date().getFullYear()} MyGlowBack.AI. Built for clinics across Nigeria.
      </footer>
    </main>
  );
}
