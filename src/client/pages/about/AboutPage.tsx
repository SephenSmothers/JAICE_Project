// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./about-components/"
// import public from "/asset-filename.ext"

import * as React from "react"

/* Reuseable section wrapper (title + opt. eyebrow + 2-column layout) */
function Section({
  id,
  title,
  eyebrow,
  copy = [],
  aside,
  children,
  reverse = false,
}: {
  id: string;
  title?: string;
  eyebrow?: string;
  copy?: string[];
  aside?: React.ReactNode;
  children?: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} className="py-12 md:py-20">
      {(eyebrow && title) && (
        <header className="mb-8">
          {eyebrow && (
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm tracking-wide">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="mt-3 text-4xl md:text-6xl font-serif font-bold tracking-tight">
              {title}
            </h2>
          )}
        </header>
      )}

      <div className={[
        "grid gap-8 md:grid-cols-2",
        reverse ? "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1" : "",
      ].join(" ")}
      >
        <div className="space-y-6 text-base md:text-lg opacity-90 text-left">
          {copy.map((p, i) => <p key={i} className="leading-relaxed">{p}</p>)}
          {children}
        </div >

        {aside && <div>{aside}</div>}
      </div >
    </section >
  );
}

/* Team Grid with hover/focus spotlight and callout line */
function TeamGrid({
  title,
  people,
}: {
  title: string;
  people: { id: string; name: string; role: string; avatar: string }[];
}) {
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <section className="py-16 md:py-24">
      <h2 className="mb-10 text-center text-4xl md:text-6xl font-serif font-bold tracking-tight">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-6 md:grid-col-4 md:gap-8">
        {people.map((p, index) => {
          const isActive = active === p.id;
          // This is to choose which side to anchor the callout line (match the wireframe)
          const calloutSide = index % 2 === 0 ? "left-4" : "right-4";

          return (
            <button
              key={p.id}
              type="button"
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.id)}
              onBlur={() => setActive(null)}
              className={[
                "group relative aspect-[3/5] w-full rounded-[2rem] border border-white/10",
                "bg-gradient-to-b from-white/10 to-white/5 shadow-xl overflow-hidden",
                "transition transform duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                isActive ? "scale-[1.04]" : active ? "opacity-50" : "",
              ].join(" ")}
              aria-describedby={`${p.id}-meta`}
            >
              <img
                src={p.avatar}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-luminosity"
              />

              {/* Callout Line + Name/Role */}
              <div
                id={`${p.id}-meta`}
                className={[
                  "pointer-events-none absolute top-6 text-left transition-opacity",
                  calloutSide,
                  isActive ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center gap-3",
                    calloutSide.includes("left") ? "flex-row" : "flex-row-reverse",
                  ].join(" ")}
                >
                  <span className="h-[2px] w-16 bg-white/70 block" />
                  <div className="text-right md:text-base">
                    <p className="text-lg md:text-xl font-bold drop-shadow-sm">
                      {p.name}
                    </p>
                    <p className="text-sm opacity-90">{p.role}</p>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm opacity-70">
        Tip: Tab to a teammate and pause to reveal their details.
      </p>
    </section>
  );
}

export function AboutPage() {

  return (
    <main className="relative mx-auto max-w-7xl px-4 md:px-8">
      {/* HERO / ABOUT */}
      <section className="relative w-full pt-14 md:pt-20">
        <div className="mx-auto max-w-none px-4 md:px-8 flex flex-wrap items-center justify-start gap-6 md:gap-10">
          <h1
            className="font-serif font-extrabold leading-none tracking-tight whitespace-nowrap"
            style={{ fontSize: "clamp(4rem, 8vw, 9rem)" }} // Issue getting font to needed size: This forces the font to be larger.
          >
            ABOUT
          </h1>

          <img
            src="/JAICE_logo.png" // May need to swap with SVG if drop shadow effect is not correct. 
            alt="JAICE logo"
            className="h-[clamp(220px,22vw,520px)] sm:h-56 md:h-72 lg:h-96 xl:h-[26rem] w-auto select-none"
            draggable={false}
          />

        </div>
      </section>

      {/* About & Philosophy blocks */}
      <Section
        id="about"
        reverse
        copy={[
          "JAICE (Job Application Intelligence & Career Enhancement) helps job seekers organize applications, track their pipeline, and surface AI-powered insights like Grit Score and tailored recommendations."
        ]}
        aside={
          <img
            src="/job-application.png"
            alt="Person completing a job application on a laptop"
            className="rounded-3xl shadow-2xl ring-1 ring-white/10 drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] object-cover aspect-[16/9] md:aspect-[5/3] object-center"
            loading="eager"
            decoding="async"
          />
        }
      >

        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-serif font-semibold">Our Philosophy</h3>
          <p className="opacity-90 leading-relaxed">
            With JAICE, we believe job seekers deserve tools that simplify the search while offering the power of Artificial Intelligence to maximize opportunities.
          </p>
        </div>
      </Section>

      {/* Meet the Team */}
      <TeamGrid
        title="MEET THE TEAM"
        people={[
          { id: "t1", name: "Teammate 1", role: "Developer", avatar: "/user1.png" },
          { id: "t2", name: "Teammate 2", role: "Developer", avatar: "/user2.png" },
          { id: "t3", name: "Teammate 3", role: "Developer", avatar: "/user1.png" },
          { id: "t4", name: "Teammate 4", role: "Developer", avatar: "/user1.png" },
        ]}
      />

      {/* Impact Section */}
      <Section
        id="impact"
        title="OUR IMPACT"
        copy={[
          "At JAICE, we are building tools that redefine the way job seekers approach applications and career opportunities. Every feature is designed to empower users and simplify their journey."
        ]}
        aside={
          <img
            src="/impact.png"
            alt="Professional reviewing applications at a desk"
            className="rounded-3xl shadow-xl object-cover w-full h-[280px] md:h-[360px]"
          />
        }
      >
        <ul className="grid gap-4 md:grid-cols-2">
          <li>
            <p className="font-semibold tracking-wide">SMART APPLICATION SORTING</p>
            <p className="opacity-90">
              Automatically organizes your job applications into stages (Applied, Interview, Offer, etc.) so you can focus on the next step.
            </p>
          </li>
          <li>
            <p className="font-semibold tracking-wide">AI-POWERED MATCHING</p>
            <p className="opacity-90">
              Analyzes your resume and job descriptions to highlight best-fit opportunities and suggest improvements.
            </p>
          </li>
          <li>
            <p className="font-semibold tracking-wide">PERSONALIZED INSIGHTS</p>
            <p className="opacity-90">
              Provides tailored career recommendations based on your skills, experiences, and market trends.
            </p>
          </li>
          <li>
            <p className="font-semibold tracking-wide">EFFICIENCY & CLARITY</p>
            <p className="opacity-90">
              Saves time by cutting through clutter and giving you a clear view of your progress and opportunities
            </p>
          </li>
        </ul>
      </Section>
    </main>
  );
}

export default AboutPage;
//this wouldn't actually end up in this file, just an example of how to use the router
