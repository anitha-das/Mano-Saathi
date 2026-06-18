import { NavLink } from "react-router-dom";
import heroImg from "../assets/wellness-hero.png";
import {
  pageWrapper,
  headingClass,
  bodyText,
  mutedText,
  cardClass,
  tagClass,
  primaryBtn,
  secondaryBtn,
} from "../styles/common";

function Home() {
  const supportPillars = [
    { title: "Share", text: "Post anonymously and express what you are carrying without pressure.", icon: "SH" },
    { title: "Support", text: "Find gentle community replies from the students who understands you .", icon: "SP" },
    { title: "Learn", text: "Read counselor-led resources for stress, anxiety, depression and self-care.", icon: "LR" },
    { title: "Grow", text: "Build steady habits with meditation streaks and mood check-ins.", icon: "GR" },
  ];

  const platformFeatures = [
    { title: "AI Saathi", text: "A calm companion that listens gently and offers emotionally safe guidance." },
    { title: "Community Discussions", text: "Student-first conversations designed for respectful support." },
    { title: "Anonymous Sharing", text: "A safer way to open up when naming feelings feels difficult." },
    { title: "Wellness Resources", text: "Articles and practical tools for everyday mental health awareness." },
    { title: "Counsellor Support", text: "Professional support pathways when students are ready to connect." },
    { title: "Meditation Features", text: "Short practices, session history, and streaks for mindful routines." },
  ];

  return (
    <main className="overflow-hidden bg-[#F7F8F1]">
      <section className="relative min-h-[calc(100vh-82px)] bg-[#EAF2E4]">
        <div className="absolute inset-x-0 top-0 h-14 bg-[#F6F8EF]" />
        <div className="absolute inset-x-0 top-14 h-20 bg-[#F6F8EF] [clip-path:ellipse(68%_58%_at_50%_0%)]" />
        <img
          src={heroImg}
          alt="A peaceful meditation landscape"
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,248,241,0.99)_0%,rgba(247,248,241,0.94)_39%,rgba(237,244,232,0.56)_63%,rgba(237,244,232,0.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(0deg,#F7F8F1,rgba(247,248,241,0))]" />

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-16 sm:pt-36 lg:pt-40">
          <div className="max-w-2xl">
            <p className={tagClass}>Mano Saathi Student Wellness</p>
            <h1 className="mt-5 text-5xl sm:text-7xl font-semibold text-[#123F31] leading-[1.02] tracking-tight [font-family:Georgia,serif]">
              You matter. Let us talk.
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-[#33433C] leading-[1.75] max-w-xl">
              A safe and supportive platform for students to share honestly, seek support, build mindful habits, and connect with care when life feels heavy.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <NavLink to="/register" className={primaryBtn}>
                Join the Community
              </NavLink>
              <NavLink to="/login" className={secondaryBtn}>
                Explore Support
              </NavLink>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
              {[
                ["Private", "Safer sharing"],
                ["24/7", "AI Saathi"],
                ["Guided", "Counsellor care"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-[#DDE7D8] bg-[#FFFDF7]/82 px-4 py-3 shadow-[0_10px_24px_rgba(24,76,56,0.08)]">
                  <p className="text-xl font-extrabold text-[#0E4A37]">{value}</p>
                  <p className="text-xs font-bold text-[#65756D]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="wellness" className="bg-[#F7F8F1] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className={tagClass}>How we support you</p>
            <h2 className={`${headingClass} mt-4 text-4xl`}>Explore. Connect. Grow.</h2>
            <p className={`${bodyText} mt-4`}>
              MANO-SAATHI brings community, reflection, resources, and professional support into one calm student wellness space.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {supportPillars.map((item) => (
              <div key={item.title} className="bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-7 shadow-[0_14px_32px_rgba(24,76,56,0.09)] hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(24,76,56,0.14)] transition duration-300">
                <div className="h-16 w-16 rounded-full bg-[#EDF4E8] border border-[#D4E2CE] text-[#0E4A37] flex items-center justify-center text-sm font-extrabold shadow-inner">
                  {item.icon}
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-[#123F31] [font-family:Georgia,serif]">{item.title}</h3>
                <p className={`${bodyText} mt-3 text-sm`}>{item.text}</p>
                <div className="mt-5 h-0.5 w-10 bg-[#1F7A58]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F7F8F1] pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-lg bg-[#0E4A37] px-7 py-8 sm:px-10 sm:py-9 shadow-[0_24px_60px_rgba(14,74,55,0.24)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start gap-5">
                <div className="hidden sm:flex h-16 w-16 rounded-full border border-white/35 bg-white/10 text-white items-center justify-center font-extrabold">
                  MS
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#BFD8C4]">Stronger together</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white [font-family:Georgia,serif]">
                    Join a community that listens, supports, and empowers you.
                  </h2>
                  <p className="mt-3 text-[#E9F3E7] leading-relaxed max-w-2xl">
                    Whether you need a quiet space to reflect or a path toward counsellor support, this platform keeps care within reach.
                  </p>
                </div>
              </div>
              <NavLink to="/register" className="shrink-0 bg-[#FFFDF7] text-[#0E4A37] font-extrabold rounded-lg px-6 py-3 shadow-[0_12px_26px_rgba(0,0,0,0.16)] hover:bg-[#EDF4E8] transition">
                Join Us Today
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="bg-[#FFFDF7] py-16 sm:py-20 border-y border-[#DDE7D8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
            <div className="rounded-lg bg-[#EDF4E8] border border-[#D4E2CE] p-8 shadow-[0_14px_32px_rgba(24,76,56,0.08)]">
              <p className={tagClass}>Community care</p>
              <h2 className={`${headingClass} mt-4`}>A safe place to share what you are feeling.</h2>
              <p className={`${bodyText} mt-4`}>
                Students can use anonymous sharing and supportive discussions to feel heard without losing privacy or dignity.
              </p>
              <NavLink to="/student-profile/community" className={`${primaryBtn} inline-block mt-7`}>
                Open Community
              </NavLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {platformFeatures.slice(0, 4).map((feature) => (
                <div key={feature.title} className={cardClass}>
                  <h3 className="text-lg font-extrabold text-[#123F31]">{feature.title}</h3>
                  <p className={`${bodyText} mt-3 text-sm`}>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="counselors" className="bg-[#F7F8F1] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className={tagClass}>Professional support</p>
              <h2 className={`${headingClass} mt-4`}>Counsellor support that feels trustworthy and approachable.</h2>
              <p className={`${bodyText} mt-4`}>
                Students can browse counsellors, read wellness articles, and request private conversations when they are ready for deeper support.
              </p>
            </div>
            <NavLink to="/student-profile/counselors" className={secondaryBtn}>
              View Counsellors
            </NavLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              ["Clear profiles", "Qualifications, expertise, availability, and bio are organized for quick trust-building."],
              ["Private requests", "Students can send a short message and begin a more personal support path."],
              ["Wellness articles", "Counsellor-created resources help students learn practical coping strategies."],
            ].map(([title, text]) => (
              <div key={title} className="bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-7 shadow-[0_14px_32px_rgba(24,76,56,0.09)]">
                <h3 className="text-xl font-semibold text-[#123F31] [font-family:Georgia,serif]">{title}</h3>
                <p className={`${bodyText} mt-3`}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFFDF7] py-16 sm:py-20">
        <div className={pageWrapper}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="rounded-lg border border-[#DDE7D8] bg-[linear-gradient(120deg,#FFFDF7,#EDF4E8)] p-8 sm:p-10 shadow-[0_18px_42px_rgba(24,76,56,0.10)]">
              <p className={tagClass}>Resources and habits</p>
              <h2 className={`${headingClass} mt-4`}>Small daily practices can become real emotional strength.</h2>
              <p className={`${bodyText} mt-4`}>
                Meditation sessions, mood check-ins, counselor articles, and AI Saathi work together to support students between difficult moments.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platformFeatures.slice(4).map((feature) => (
                  <div key={feature.title} className="rounded-lg border border-[#D4E2CE] bg-[#FFFDF7]/78 p-5">
                    <h3 className="font-extrabold text-[#123F31]">{feature.title}</h3>
                    <p className={`${mutedText} mt-2 leading-relaxed`}>{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-[#0E4A37] p-8 sm:p-10 text-center flex flex-col justify-center shadow-[0_24px_60px_rgba(14,74,55,0.22)]">
              <p className="text-5xl text-[#BFD8C4] [font-family:Georgia,serif]">"</p>
              <p className="text-xl sm:text-2xl leading-relaxed text-white [font-family:Georgia,serif]">
                Mental health is not a destination, but a process. You do not have to walk it alone.
              </p>
              <p className="mt-5 text-sm font-bold text-[#BFD8C4]">MANO-SAATHI</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
