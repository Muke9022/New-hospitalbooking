"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Heart,
  ShieldCheck,
  Stethoscope,
  Users,
  Award,
  Clock,
  ArrowUpRight,
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";

import StatsSection from "@/components/landing/StatsSection";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

/**
 * ── PALETTE ──────────────────────────────────────────────
 * Deep bg   #0B1310  (green-black, not generic slate)
 * Card bg   #12201C
 * Teal 500  #2DD4BF  — structural accent: eyebrows, links, icons, the pulse line
 * Teal 700  #0F766E  — buttons, gradients
 * Coral 400 #FB8A6B  — reserved for two emotional beats only:
 *                      the hero's italic word, and the CTA quote icon
 * Ink 100   #F4F1EA  — warm off-white text (not pure white)
 * Ink 400   #A8B5B0  — muted sage-gray body copy
 * ────────────────────────────────────────────────────────
 */

function getImageUrl(imageField: any): string {
  if (!imageField) return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600";
  let url = "";
  if (typeof imageField === "string") {
    url = imageField;
  } else if (Array.isArray(imageField) && imageField.length > 0) {
    url = imageField[0]?.url || imageField[0]?.attributes?.url || "";
  } else if (imageField?.data?.attributes?.url) {
    url = imageField.data.attributes.url;
  } else if (imageField?.data?.url) {
    url = imageField.data.url;
  } else if (imageField?.url) {
    url = imageField.url;
  }

  if (!url) return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:1337${url}`;
}

const TIMELINE = [
  {
    year: "1978",
    title: "A single ward, one promise",
    copy: "MediBook opened as a 40-bed hospital with a rule that still holds: no one is treated as a chart before they're treated as a person.",
  },
  {
    year: "1994",
    title: "Trauma & emergency wing",
    copy: "A level II trauma center opened, cutting average emergency response times for the surrounding area by more than half.",
  },
  {
    year: "2009",
    title: "MediBook Children's Pavilion",
    copy: "A dedicated pediatric campus, designed with families and child psychologists, not just architects, in the room.",
  },
  {
    year: "2023",
    title: "Research & precision medicine center",
    copy: "Genomic and precision-oncology programs launched, bringing trial-stage treatment options closer to home for patients.",
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Patients before paperwork",
    copy: "Every process on this campus is judged by one question: does this make the patient's path easier, or just ours.",
  },
  {
    icon: ShieldCheck,
    title: "Radical transparency",
    copy: "Clear pricing, honest prognoses, and no waiting room where you can't get a straight answer about what happens next.",
  },
  {
    icon: Stethoscope,
    title: "Evidence over habit",
    copy: "Protocols are revisited as research evolves — 'we've always done it this way' is not a reason on its own.",
  },
  {
    icon: Users,
    title: "Care as a team sport",
    copy: "Physicians, nurses, social workers, and family are treated as one coordinated team around every patient.",
  },
];

const DEPARTMENTS = [
  "Cardiology", "Oncology", "Neurology", "Orthopedics",
  "Maternity & NICU", "Emergency & Trauma", "Pediatrics", "Behavioral Health",
];

const ACCREDITATIONS = [
  "Joint Commission Accredited",
  "Magnet Recognized Nursing",
  "Level II Trauma Center",
  "Baby-Friendly Designated",
];

function PulseDivider({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <svg
      ref={ref}
      viewBox="0 0 1200 80"
      className={`w-full h-12 md:h-16 ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M0 40 H420 L460 40 L480 8 L505 72 L525 40 L560 40 L580 24 L600 40 H1200"
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 0.55 } : {}}
        transition={{ duration: reduceMotion ? 0 : 1.6, ease: "easeInOut" }}
      />
    </svg>
  );
}

export default function AboutPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // ── motion variants — collapse to opacity-only when reduced motion is requested ──
  const fadeUp: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
      };

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  };

  // Signature move: the timeline's spine fills in sync with scroll position,
  // echoing the pulse divider — the hospital's history "beats" as you read it.
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 65%"],
  });
  const timelineScale = useTransform(timelineProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.doctors.list();
        setDoctors(res.data || []);
      } catch (err) {
        console.error("Error loading doctors for About Page:", err);
      }
    };
    fetchDoctors();
  }, []);

  const leadDoctor = doctors[0];

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <main className={`${display.variable} ${body.variable} font-body relative min-h-screen text-[#F4F1EA] antialiased bg-[#0B1310]`}>
      {/* BACKGROUND IMAGE */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-75 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/jmkc-about.jpg')" }}
      />
      {/* Overlay — warm dark, not pure black */}
      <div className="fixed inset-0 bg-[#0B1310]/50 z-0 pointer-events-none" />

      {/* CONTENT AREA */}
      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center">
          <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center w-full">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="bg-[#12201C]/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl"
            >
              <motion.p variants={fadeUp} className="uppercase tracking-[0.25em] text-xs font-bold text-[#2DD4BF] mb-4">
                MediBook Hospital · Est. 1978
              </motion.p>

              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl leading-[1.1] tracking-tight text-[#F4F1EA]">
                Medicine that remembers <span className="italic font-normal text-[#FB8A6B]">you're</span> the patient, not the case.
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-5 text-base text-[#A8B5B0] leading-relaxed font-normal">
                For nearly five decades, MediBook has paired specialist-level medicine with the kind of attention you'd want for your own family.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/booking" className="group inline-flex items-center gap-2 rounded-full bg-[#0F766E] text-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-[#14B8A6] shadow-lg">
                  Book an appointment
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link href="/doctors" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-[#F4F1EA] transition-colors hover:bg-white/20">
                  Explore doctors
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0.3 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] md:aspect-[3/4]"
            >
              <div className="absolute -inset-4 rounded-[2.5rem] border border-[#2DD4BF]/15" />

              <div className="relative h-full w-full rounded-[2rem] bg-[#12201C]/90 backdrop-blur-md overflow-hidden shadow-2xl border border-white/10">
                {leadDoctor && (
                  <img
                    src={getImageUrl(leadDoctor.image)}
                    alt={leadDoctor.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1310]/95 via-[#0B1310]/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-[#F4F1EA] z-10">
                  <p className="font-display italic text-lg leading-snug drop-shadow-sm">
                    "Every patient deserves a doctor who has time to actually listen."
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-widest text-[#5EEAD4] font-bold drop-shadow-sm">
                    {leadDoctor ? `${leadDoctor.name} · ${leadDoctor.speciality || 'Chief Medical Officer'}` : 'Dr. Amara Okafor · Chief Medical Officer'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 px-6">
            <PulseDivider className="mx-auto max-w-6xl" />
          </div>
        </section>

        {/* STATS SECTION */}
        <StatsSection />

        {/* TIMELINE SECTION — spine fills in sync with scroll (signature motion) */}
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="mb-14">
            <p className="uppercase tracking-[0.25em] text-xs font-bold text-[#2DD4BF] mb-4">Our story</p>
            <h2 className="font-display text-3xl md:text-4xl text-[#F4F1EA] max-w-xl">
              Four decades, told in the moments that changed how we treat people.
            </h2>
          </motion.div>

          <div ref={timelineRef} className="relative pl-8 md:pl-12">
            {/* static track */}
            <div className="absolute left-[7px] md:left-[11px] top-2 bottom-2 w-px bg-white/10" />
            {/* animated spine, grows with scroll progress */}
            <motion.div
              className="absolute left-[7px] md:left-[11px] top-2 w-px bg-[#2DD4BF] origin-top"
              style={{ scaleY: reduceMotion ? 1 : timelineScale, height: "calc(100% - 16px)" }}
            />
            {TIMELINE.map((item) => (
              <motion.div key={item.year} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} variants={fadeUp} className="relative pb-14 last:pb-0">
                <div className="absolute -left-8 md:-left-12 top-1.5 h-3.5 w-3.5 rounded-full bg-[#2DD4BF] ring-4 ring-[#0B1310]" />
                <p className="font-display text-2xl text-[#2DD4BF] font-bold">{item.year}</p>
                <h3 className="mt-1 text-lg font-bold text-[#F4F1EA]">{item.title}</h3>
                <p className="mt-2 text-[#A8B5B0] leading-relaxed max-w-xl text-sm">{item.copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="px-6">
          <PulseDivider className="mx-auto max-w-6xl opacity-40" />
        </div>

        {/* CORE VALUES */}
        <section className="my-12">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <motion.p initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="uppercase tracking-[0.25em] text-xs font-bold text-[#2DD4BF] mb-4">
              What guides us
            </motion.p>
            <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="font-display text-3xl md:text-4xl text-[#F4F1EA] max-w-xl mb-14">
              Values we hold staff to, not just print on a wall.
            </motion.h2>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid sm:grid-cols-2 gap-6">
              {VALUES.map((v) => (
                <motion.div key={v.title} variants={fadeUp} className="bg-[#12201C]/60 backdrop-blur-md p-8 md:p-10 rounded-2xl border border-white/10 hover:bg-[#12201C]/90 hover:border-[#2DD4BF]/25 transition-colors duration-300 shadow-lg">
                  <v.icon className="h-7 w-7 text-[#2DD4BF]" strokeWidth={1.8} />
                  <h3 className="mt-5 text-lg font-bold text-[#F4F1EA]">{v.title}</h3>
                  <p className="mt-2 text-sm text-[#A8B5B0] leading-relaxed">{v.copy}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* DEPARTMENTS — single fade-in block, no per-chip stagger (less "AI slideshow") */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="uppercase tracking-[0.25em] text-xs font-bold text-[#2DD4BF] mb-4">
            Specialties
          </motion.p>
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="font-display text-3xl md:text-4xl text-[#F4F1EA] max-w-xl mb-12">
            22 departments. One coordinated record.
          </motion.h2>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="flex flex-wrap gap-3">
            {DEPARTMENTS.map((d) => (
              <span key={d} className="rounded-full border border-white/15 bg-[#12201C]/70 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-[#F4F1EA] hover:bg-[#0F766E] hover:border-[#0F766E] transition-colors duration-300 shadow-sm cursor-default">
                {d}
              </span>
            ))}
          </motion.div>
        </section>

        {/* DOCTOR CARDS */}
        <section className="my-12">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <motion.p initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="uppercase tracking-[0.25em] text-xs font-bold text-[#2DD4BF] mb-4">
                  Leadership & Doctors
                </motion.p>
                <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="font-display text-3xl md:text-4xl text-[#F4F1EA] max-w-xl">
                  The medical professionals accountable for your health.
                </motion.h2>
              </div>

              {doctors.length > 0 && (
                <div className="flex items-center gap-3 self-end">
                  <button
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#12201C]/80 text-[#F4F1EA] transition-colors hover:bg-[#0F766E] hover:border-[#0F766E] shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={scrollRight}
                    aria-label="Scroll right"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#12201C]/80 text-[#F4F1EA] transition-colors hover:bg-[#0F766E] hover:border-[#0F766E] shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {doctors.length > 0 ? (
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-2 -mx-2 px-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {doctors.map((doc) => (
                  <motion.div
                    key={doc.id || doc.documentId}
                    whileHover={reduceMotion ? {} : { y: -6, borderColor: "rgba(45,212,191,0.4)" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-[300px] md:w-[340px] shrink-0 rounded-3xl bg-[#12201C]/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                  >
                    <div className="relative h-64 w-full overflow-hidden bg-[#0B1310]">
                      <img
                        src={getImageUrl(doc.image)}
                        alt={doc.name}
                        className="h-full w-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12201C] via-transparent to-transparent" />
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="inline-block rounded-full bg-[#2DD4BF]/15 px-3 py-1 text-xs font-bold text-[#2DD4BF] border border-[#2DD4BF]/30 mb-3">
                          {doc.speciality || doc.specialty || "Specialist"}
                        </span>
                        <h3 className="font-display text-xl font-bold text-[#F4F1EA]">{doc.name}</h3>
                        <p className="text-sm text-[#A8B5B0] mt-2 font-normal leading-relaxed">
                          {doc.department || doc.hospital || "MediBook Hospital"}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A8B5B0]">
                        <span>Board Certified</span>
                        <Link href="/doctors" className="inline-flex items-center gap-1 font-semibold text-[#2DD4BF] hover:text-[#5EEAD4]">
                          View profile <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#A8B5B0]">Loading medical team from server...</p>
            )}
          </div>
        </section>

        {/* ACCREDITATIONS — single fade-in, no per-item stagger */}
        <section className="mx-auto max-w-6xl px-6 py-14 border-t border-white/10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="flex flex-wrap items-center justify-between gap-6">
            {ACCREDITATIONS.map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm font-semibold text-[#A8B5B0]">
                <Award className="h-4 w-4 text-[#FBBF77]" strokeWidth={2} />
                {a}
              </div>
            ))}
          </motion.div>
        </section>

        {/* CTA — the second and last place coral appears */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F766E] to-[#134E4A] px-8 py-14 md:px-16 md:py-16 text-[#F4F1EA] shadow-2xl border border-white/10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
            <div className="absolute -right-6 -bottom-20 h-56 w-56 rounded-full border border-white/10" />

            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div>
                <Quote className="h-8 w-8 text-[#FB8A6B] mb-4" strokeWidth={1.5} />
                <h2 className="font-display text-3xl md:text-4xl max-w-lg leading-snug">
                  Whatever brought you here, you don't have to explain it twice.
                </h2>
                <p className="mt-4 text-[#CFE8E3] max-w-md flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" /> Same-week appointments for most specialties.
                </p>
              </div>
              <Link href="/booking" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#F4F1EA] text-[#0F766E] px-7 py-4 text-sm font-bold hover:bg-white transition-colors shadow-md">
                Schedule a visit
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}