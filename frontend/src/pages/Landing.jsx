import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  MapPin,
  Zap,
  Users,
  BarChart3,
  MessageCircle,
} from 'lucide-react';
import LandingNav from '../components/LandingNav';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80';

const Landing = () => {
  return (
    <div id="top" className="bg-white text-neutral-900">
      <LandingNav />

      {/* Hero */}
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-neutral-800 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55)), url(${HERO_IMAGE})`,
        }}
      >

        <div className="relative z-10 flex flex-1 flex-col px-6 pb-10 pt-28 lg:px-10 lg:pb-14 lg:pt-32">
          <p className="max-w-xs text-sm font-light tracking-wide text-white/90">
            Simplifying plot sales
          </p>

          <div className="mt-auto flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Land
              <br />
              In Motion
            </h1>

            <div className="max-w-md space-y-5 lg:pb-2">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <MapPin className="h-5 w-5 text-black" strokeWidth={2} />
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <Building2 className="h-5 w-5 text-black" strokeWidth={2} />
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/90 sm:text-base">
                PlotCRM helps Indian real estate agents track inventory, nurture leads,
                schedule site visits, and share listings on WhatsApp — all from one workspace.
              </p>
            </div>
          </div>
        </div>

        <a
          href="#about"
          className="relative z-10 flex items-center justify-end gap-2 px-6 pb-8 text-xs font-medium text-white/80 transition hover:text-white lg:px-10"
        >
          Scroll to discover more
          <ArrowDown className="h-4 w-4" />
        </a>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-sm font-medium tracking-wide text-neutral-500">
            [ About us ]
          </p>
          <h2 className="max-w-4xl text-3xl font-semibold leading-snug tracking-tight text-neutral-800 sm:text-4xl md:text-5xl lg:text-6xl">
            PlotCRM is on a mission to make plot sales clearer, faster, and more personal
            for every agent and buyer.
          </h2>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-neutral-600">
            From first inquiry to site visit and booking, your team gets a single source of
            truth — plots, customers, analytics, and AI-assisted outreach in one place.
          </p>
          <Link
            to="/signup"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="border-t border-neutral-100 bg-neutral-50 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-medium text-neutral-500">[ Solutions ]</p>
          <h3 className="mb-16 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Built for how Indian agents actually work
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: 'Plot inventory',
                text: 'Status, pricing, dimensions, and media for every listing in one dashboard.',
              },
              {
                icon: Users,
                title: 'Lead pipeline',
                text: 'Track interest, priority, and follow-ups without spreadsheets.',
              },
              {
                icon: MessageCircle,
                title: 'WhatsApp ready',
                text: 'Share plot details and brochures with one tap.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-neutral-200 bg-white p-8 transition hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-accent">
                  <Icon className="h-5 w-5 text-black" />
                </div>
                <h4 className="text-lg font-semibold">{title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-medium text-neutral-500">[ Features ]</p>
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Intelligence where it counts
            </h3>
            <ul className="mt-10 space-y-6">
              {[
                { icon: Zap, label: 'AI search & listing copy powered by Groq' },
                { icon: BarChart3, label: 'Analytics on plots, visits, and conversions' },
                { icon: Building2, label: 'Brochures and gallery for every plot' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-neutral-700">{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-neutral-100">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
              alt="Real estate professional with keys"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-neutral-900 px-6 py-20 text-white lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to move your plots faster?
            </h3>
            <p className="mt-2 text-neutral-400">Sign in or create an account in under a minute.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium transition hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-accent/90"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-16 max-w-7xl text-xs text-neutral-500">
          © {new Date().getFullYear()} PlotCRM. Real estate plot management.
        </p>
      </section>
    </div>
  );
};

export default Landing;
