import { FormEvent, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Type declarations                                                  */
/* ------------------------------------------------------------------ */
declare global {
  interface Window {
    hcaptcha?: {
      render: (container: HTMLElement, config: Record<string, unknown>) => string;
      getResponse: (widgetId?: string) => string;
      reset: (widgetId?: string) => void;
    };
    onHcaptchaReady?: () => void;
  }
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const WEB3FORMS_KEY = "90b277b4-2dde-4809-aeee-e2132f215db9";
const HCAPTCHA_SITEKEY = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "About Me", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const projectCards = [
  {
    title: "Cafe Web Design",
    description: "Simple cafe web design",
    image: "https://c.animaapp.com/NPodFjaQ/img/rectangle-4@2x.png",
    imageAlt: "Cafe web design project preview",
  },
  {
    title: "Finance App Design",
    description: "Full finance app design",
    image: "https://c.animaapp.com/NPodFjaQ/img/rectangle-5@2x.png",
    imageAlt: "Finance app design project preview",
  },
  {
    title: "News Web Design",
    description: "Landing page design",
    image: "https://c.animaapp.com/NPodFjaQ/img/rectangle-6@2x.png",
    imageAlt: "News web design project preview",
  },
  {
    title: "Library App Design",
    description: "Full library app design",
    image: "https://c.animaapp.com/NPodFjaQ/img/rectangle-8@2x.png",
    imageAlt: "Library app design project preview",
  },
  {
    title: "Basic Portfolio",
    description: "Basic design portfolio",
    image: "https://c.animaapp.com/NPodFjaQ/img/rectangle-9@2x.png",
    imageAlt: "Basic portfolio project preview",
  },
];

const contactCards = [
  {
    title: "Email",
    value: "handikaakbara@gmail.com",
    href: "mailto:handikaakbara@gmail.com",
    icon: "https://c.animaapp.com/NPodFjaQ/img/ic-outline-email.svg",
    iconAlt: "Email icon",
  },
  {
    title: "Instagram",
    value: "@arrya.00",
    href: "https://www.instagram.com/arryaa.00/",
    icon: "https://c.animaapp.com/NPodFjaQ/img/mdi-instagram.svg",
    iconAlt: "Instagram icon",
  },
  {
    title: "Github",
    value: "@barbaraaO-O",
    href: "https://github.com/barbaraaO-O",
    icon: "https://c.animaapp.com/NPodFjaQ/img/mdi-github.svg",
    iconAlt: "Github icon",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export const Desktop = (): JSX.Element => {
  /* ---- State ---- */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
  });
  const [formStatus, setFormStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formMessage, setFormMessage] = useState("");
  const [activeProject, setActiveProject] = useState<{
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  } | null>(null);

  /* ---- Refs ---- */
  const hcaptchaContainerRef = useRef<HTMLDivElement>(null);
  const hcaptchaWidgetId = useRef<string | null>(null);

  /* ---- Scroll detection (navbar glassmorphism) ---- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- Lock body when mobile menu or project preview is open ---- */
  useEffect(() => {
    if (mobileMenuOpen || activeProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, activeProject]);

  /* ---- Close lightbox on Escape key ---- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveProject(null);
      }
    };
    if (activeProject) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProject]);

  /* ---- Intersection Observer for scroll-reveal ---- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    document
      .querySelectorAll(".scroll-reveal")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  /* ---- hCaptcha explicit render ---- */
  useEffect(() => {
    const renderCaptcha = () => {
      if (
        window.hcaptcha &&
        hcaptchaContainerRef.current &&
        hcaptchaWidgetId.current === null
      ) {
        try {
          hcaptchaWidgetId.current = window.hcaptcha.render(
            hcaptchaContainerRef.current,
            { sitekey: HCAPTCHA_SITEKEY, theme: "light" }
          );
        } catch {
          /* widget already rendered */
        }
      }
    };

    // Try rendering immediately (script may have already loaded)
    renderCaptcha();
    // Also register callback for deferred loading
    window.onHcaptchaReady = renderCaptcha;

    return () => {
      window.onHcaptchaReady = undefined;
    };
  }, []);

  /* ---- Helpers ---- */
  const closeMenu = () => setMobileMenuOpen(false);

  /* ---- Form Submission (Web3Forms + hCaptcha) ---- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.description.trim()
    ) {
      setFormStatus("error");
      setFormMessage("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus("error");
      setFormMessage("Please enter a valid email address.");
      return;
    }

    // hCaptcha token
    let hcaptchaToken = "";
    try {
      hcaptchaToken =
        window.hcaptcha?.getResponse(hcaptchaWidgetId.current ?? undefined) ??
        "";
    } catch {
      /* hCaptcha may not be available */
    }

    if (!hcaptchaToken) {
      setFormStatus("error");
      setFormMessage("Please complete the captcha verification.");
      return;
    }

    setFormStatus("loading");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: formData.name,
          email: formData.email,
          message: formData.description,
          "h-captcha-response": hcaptchaToken,
          subject: `Portfolio Contact from ${formData.name}`,
          from_name: "Portfolio Website",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormStatus("success");
        setFormMessage(
          "Message sent successfully! I'll get back to you soon. 🎉"
        );
        setFormData({ name: "", email: "", description: "" });
        try {
          window.hcaptcha?.reset(hcaptchaWidgetId.current ?? undefined);
        } catch {
          /* ignore */
        }
      } else {
        setFormStatus("error");
        setFormMessage(
          data.message || "Something went wrong. Please try again."
        );
      }
    } catch {
      setFormStatus("error");
      setFormMessage(
        "Network error. Please check your connection and try again."
      );
    }
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* ============================================================ */}
      {/*  NAVBAR                                                       */}
      {/* ============================================================ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/85 backdrop-blur-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a
            href="#home"
            className="[font-family:'Inter',Helvetica] font-medium italic text-xl sm:text-2xl lg:text-[28px] text-black z-10 hover:text-green-800 transition-colors duration-300"
          >
            Handika Akbar
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="nav-link [font-family:'Inter',Helvetica] font-normal text-black/80 hover:text-green-700 text-[15px] lg:text-[17px] transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className="ml-2 px-6 py-2.5 rounded-full text-sm lg:text-[15px] font-medium bg-gradient-to-br from-[#96fd8e] via-[#cafec7] to-[#e7fee5] text-green-900 hover:shadow-lg hover:shadow-green-200/60 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Hire Me
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden z-50 w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={`block w-6 h-[2px] bg-black rounded-full transition-all duration-300 origin-center ${
                mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-black rounded-full transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0 scale-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-black rounded-full transition-all duration-300 origin-center ${
                mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`md:hidden fixed inset-0 bg-white/[0.97] backdrop-blur-3xl transition-all duration-500 flex flex-col items-center justify-center gap-7 ${
            mobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } ${mobileMenuOpen ? "mobile-menu-open" : ""}`}
        >
          {navItems.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              className="mobile-link [font-family:'Inter',Helvetica] text-2xl sm:text-3xl font-medium text-black hover:text-green-700 transition-colors duration-300"
              style={{
                transitionDelay: mobileMenuOpen ? `${100 + i * 80}ms` : "0ms",
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={closeMenu}
            className="mobile-link mt-4 px-8 py-3 rounded-full text-lg font-medium bg-gradient-to-br from-[#96fd8e] via-[#cafec7] to-[#e7fee5] text-green-900 hover:shadow-lg transition-all duration-300"
            style={{
              transitionDelay: mobileMenuOpen
                ? `${100 + navItems.length * 80}ms`
                : "0ms",
            }}
          >
            Hire Me
          </a>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        {/* Background: white top → green gradient bottom (matching design) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white from-40% via-[#befcb8]/50 via-75% to-[#b2fcac]/60 pointer-events-none" />

        {/* Decorative floating orbs */}
        <div className="absolute top-[15%] left-[8%] w-40 h-40 sm:w-56 sm:h-56 bg-green-300/15 rounded-full blur-3xl animate-float pointer-events-none" />
        <div
          className="absolute top-[55%] right-[10%] w-48 h-48 sm:w-64 sm:h-64 bg-green-200/15 rounded-full blur-3xl animate-float-reverse pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        {/* Main hero container — relative so children can overlap */}
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 min-h-screen flex flex-col">
          {/* Spacer for navbar */}
          <div className="h-20 lg:h-24 flex-shrink-0" />

          {/* WELCOME watermark — behind everything */}
          <div className="absolute top-[90px] lg:top-[10px] left-1/2 -translate-x-1/2 animate-welcome [font-family:'Lexend_Giga',Helvetica] font-bold text-black/[0.07] text-[clamp(3.5rem,13vw,12rem)] whitespace-nowrap select-none pointer-events-none z-[1]">
            WELCOME
          </div>

          {/* Hero content area */}
          <div className="relative flex-1 flex flex-col lg:block">

            {/* ---- MOBILE/TABLET layout (< lg) — overlapping ---- */}
            <div className="lg:hidden relative w-full min-h-[calc(100vh-0rem)] pb-10">
              {/* Portrait — centered, absolute, larger, aligned to top */}
              <div className="absolute inset-x-0 -top-20 bottom-0 flex items-start justify-center pt-[2%] z-[2] pointer-events-none">
                <img
                  src="https://c.animaapp.com/NPodFjaQ/img/ff139437-4e04-4201-8092-fc1a18bee5e1-1.png"
                  alt="Portrait of Handika Akbar"
                  className="animate-hero-image h-[92vh] min-h-[630px] max-w-[150vw] w-auto object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.10)]"
                />
              </div>

              {/* Text elements overlapping the photo */}
              {/* Top Left: Name */}
              <div className="absolute left-[6%] top-[10%] z-[3]">
                <h1 className="animate-hero-text [font-family:'Inter',Helvetica] font-light italic text-5xl sm:text-6xl leading-[0.95] [text-shadow:2px_2px_15px_rgba(255,255,255,0.95),0_0_25px_rgba(255,255,255,0.8),-2px_-2px_15px_rgba(255,255,255,0.95)]">
                  I&apos;M <br /> AKBAR
                </h1>
              </div>

              {/* Bottom Left: Description */}
              <div className="absolute left-[6%] bottom-[16%] z-[3] max-w-[80%] sm:max-w-[280px]">
                <p
                  className="animate-hero-text [font-family:'Inter',Helvetica] font-normal text-black text-[16px] sm:text-[16px] leading-relaxed [text-shadow:1px_1px_10px_rgba(255,255,255,0.95),0_0_20px_rgba(255,255,255,0.8),-1px_-1px_10px_rgba(255,255,255,0.95)]"
                  style={{ animationDelay: "0.3s" }}
                >
                  Hello, I&apos;m Handika Akbar, a Web and UI/UX Designer From
                  Senior High School in Indonesia who is focused on creating
                  clean, functional user experiences
                </p>
              </div>

              {/* Bottom Right: Role */}
              <div className="absolute right-[5%] bottom-[35%] z-[3] text-right">
                <h2
                  className="animate-hero-text [font-family:'Inter',Helvetica] font-bold text-3xl sm:text-4xl leading-tight [text-shadow:2px_2px_15px_rgba(255,255,255,0.50),0_0_25px_rgba(255,255,255,0.5),-2px_-2px_15px_rgba(255,255,255,0.40)]"
                  style={{ animationDelay: "0.5s" }}
                >
                  WEB<br />UI/UX<br />DESIGNER
                </h2>
              </div>
            </div>

            {/* ---- DESKTOP layout (lg+) — overlapping like Figma ---- */}
            <div className="hidden lg:block relative w-full h-full min-h-[calc(100vh-6rem)]">
              {/* Portrait */}
              <div className="absolute inset-0 flex items-start justify-center pt-[1%] z-[2] pointer-events-none">
                <img
                  src="https://c.animaapp.com/NPodFjaQ/img/ff139437-4e04-4201-8092-fc1a18bee5e1-1.png"
                  alt="Portrait of Handika Akbar standing in front of the welcome headline"
                  className="animate-hero-image h-[80vh] max-h-[680px] xl:max-h-[750px] 2xl:max-h-[820px] w-auto object-contain drop-shadow-[0_20px_80px_rgba(0,0,0,0.08)] translate-x-[5%]"
                />
              </div>
              {/* "I'M AKBAR" */}
              <div className="absolute left-[7%] top-[28%] z-[3]">
                <h1 className="animate-hero-text [font-family:'Inter',Helvetica] font-light italic text-8xl xl:text-[100px] 2xl:text-[110px] leading-[0.95] [text-shadow:2px_2px_20px_rgba(255,255,255,0.9),0_0_40px_rgba(255,255,255,0.7)]">
                  I&apos;M <br /> AKBAR
                </h1>
              </div>
              {/* Description */}
              <div className="absolute left-[7%] bottom-[10%] z-[3] max-w-[280px] xl:max-w-[320px]">
                <p
                  className="animate-hero-text [font-family:'Inter',Helvetica] font-normal text-black text-[15px] xl:text-base 2xl:text-lg leading-relaxed [text-shadow:1px_1px_12px_rgba(255,255,255,0.95),0_0_30px_rgba(255,255,255,0.8),-1px_-1px_12px_rgba(255,255,255,0.95)]"
                  style={{ animationDelay: "0.3s" }}
                >
                  Hello, I&apos;m Handika Akbar, a Web and UI/UX Designer From
                  Senior High School in Indonesia who is focused on creating
                  clean, functional user experiences
                </p>
              </div>
              {/* "WEB UI/UX DESIGNER" */}
              <div className="absolute right-[7%] bottom-[10%] z-[3] text-left">
                <h2
                  className="animate-hero-text [font-family:'Inter',Helvetica] font-bold text-5xl xl:text-6xl 2xl:text-7xl leading-tight [text-shadow:2px_2px_20px_rgba(255,255,255,0.9),0_0_40px_rgba(255,255,255,0.7)]"
                  style={{ animationDelay: "0.5s" }}
                >
                  WEB<br />UI/UX<br />DESIGNER
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ============================================================ */}
        {/*  ABOUT SECTION                                                */}
        {/* ============================================================ */}
        <section
          id="about"
          aria-labelledby="about-heading"
          className="relative py-20 sm:py-28 lg:py-36 overflow-hidden"
        >
          {/* Background: green top (continuing from hero) → white bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#b2fcac]/60 via-[#b2fcac]/20 to-white pointer-events-none" />

          {/* Decorative orb */}
          <div className="absolute -right-20 top-1/4 w-72 h-72 bg-green-200/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Image */}
              <div className="w-full lg:w-1/2 scroll-reveal">
                <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-green-900/10 group">
                  <img
                    src="https://c.animaapp.com/NPodFjaQ/img/rectangle-3.png"
                    alt="About me section — Handika Akbar's workspace"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Text */}
              <div
                className="w-full lg:w-1/2 text-center lg:text-left scroll-reveal"
                style={{ transitionDelay: "0.15s" }}
              >
                <span className="[font-family:'Inter',Helvetica] font-medium text-black/60 text-base sm:text-lg tracking-wide">
                  About Me
                </span>
                <h2
                  id="about-heading"
                  className="mt-3 [font-family:'Inter',Helvetica] font-semibold text-black text-3xl sm:text-4xl lg:text-[48px] xl:text-[54px] leading-[1.15]"
                >
                  Where creativity <br className="hidden lg:block" />
                  meets functionality
                </h2>
                <p className="mt-6 [font-family:'Inter',Helvetica] font-medium text-black/65 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                  I&apos;m a passionate Web and UI/UX Designer who enjoys
                  creating clean, modern, and user-friendly interfaces while
                  continuously learning and exploring new technologies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  PROJECTS SECTION                                             */}
        {/* ============================================================ */}
        <section
          id="projects"
          aria-labelledby="projects-heading"
          className="relative py-20 sm:py-28 lg:py-36 overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[#B2FCAC]/80 to-white pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            {/* Header */}
            <div className="text-center mb-12 lg:mb-16 scroll-reveal">
              <span className="[font-family:'Inter',Helvetica] font-semibold text-[#0873008f] text-sm sm:text-base tracking-widest uppercase">
                Project
              </span>
              <h2
                id="projects-heading"
                className="mt-3 [font-family:'Inter',Helvetica] font-bold text-black text-3xl sm:text-4xl lg:text-[40px]"
              >
                Recent Projects
              </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {projectCards.map((project, index) => (
                <article
                  key={project.title}
                  className="card-glow scroll-reveal group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-green-200/80 shadow-sm hover:shadow-xl hover:shadow-green-100/40 transition-all duration-500 hover:-translate-y-2"
                  style={{ transitionDelay: `${index * 0.08}s` }}
                >
                  {/* Image */}
                  <div className="aspect-[3/2] overflow-hidden bg-gray-50">
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5 sm:p-6 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="[font-family:'Inter',Helvetica] font-medium text-black text-lg sm:text-xl leading-snug">
                        {project.title}
                      </h3>
                      <p className="mt-1.5 [font-family:'Inter',Helvetica] font-medium text-black/45 text-sm sm:text-[15px]">
                        {project.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveProject(project)}
                      aria-label={`Preview ${project.title}`}
                      className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all duration-300 group-hover:rotate-12"
                    >
                      <img
                        src="https://c.animaapp.com/NPodFjaQ/img/ic-baseline-zoom-in-4.svg"
                        alt=""
                        aria-hidden="true"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  CONTACT SECTION                                              */}
        {/* ============================================================ */}
        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="relative py-20 sm:py-28 lg:py-36 overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-[#B2FCAC]/75 pointer-events-none" />

          {/* Decorative orbs */}
          <div className="absolute -left-24 top-1/3 w-64 h-64 bg-green-200/15 rounded-full blur-3xl animate-float pointer-events-none" />
          <div
            className="absolute -right-16 bottom-1/4 w-48 h-48 bg-green-300/10 rounded-full blur-3xl animate-float-reverse pointer-events-none"
            style={{ animationDelay: "3s" }}
          />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            {/* Header */}
            <div className="text-center mb-12 lg:mb-16 scroll-reveal">
              {/* Contact Info badge */}
              <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-black rounded-lg mb-6 sm:mb-8">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#0873008f] rounded-full" />
                <span className="[font-family:'Inter',Helvetica] font-semibold text-black text-lg sm:text-xl lg:text-2xl">
                  Contact Info
                </span>
              </div>

              <h2
                id="contact-heading"
                className="[font-family:'Inter',Helvetica] font-extrabold text-black text-3xl sm:text-4xl lg:text-5xl xl:text-[58px] leading-tight"
              >
                Get in touch with me for
                <br className="hidden sm:block" />
                more information
              </h2>
              <p className="mt-5 sm:mt-6 [font-family:'Inter',Helvetica] font-medium text-black/65 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
                If you have a question, just reach out. I&apos;d be happy to
                connect with you.
              </p>
            </div>

            {/* Contact info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-12 lg:mb-16">
              {contactCards.map((card, index) => (
                <a
                  key={card.title}
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    card.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  aria-label={`${card.title}: ${card.value}`}
                  className="scroll-reveal group flex items-center gap-4 p-5 lg:p-6 bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-500 hover:-translate-y-1"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
                    <img
                      src={card.icon}
                      alt={card.iconAlt}
                      className="w-7 h-7 lg:w-8 lg:h-8 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="[font-family:'Inter',Helvetica] font-bold text-black text-lg lg:text-xl">
                      {card.title}
                    </div>
                    <div className="[font-family:'Inter',Helvetica] font-normal text-black/70 text-sm lg:text-base truncate">
                      {card.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Form container */}
            <div className="scroll-reveal max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-[#96ff59] via-[#89ff89] to-[#5dff5d] rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl shadow-green-950/40 overflow-hidden">
                {/* Background decorative circles inside form */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-500/[0.06] rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-green-400/[0.05] rounded-full blur-2xl pointer-events-none" />

                {/* Form header */}
                <div className="relative text-center mb-8 sm:mb-10">
                  <h3 className="[font-family:'Inter',Helvetica] font-semibold text-black text-2xl sm:text-3xl lg:text-[32px]">
                    Leave a message
                  </h3>
                  <p className="mt-3 sm:mt-4 [font-family:'Inter',Helvetica] font-normal text-black/70 text-sm sm:text-base lg:text-lg max-w-md mx-auto leading-relaxed">
                    Have a question, project, or collaboration in mind? Leave a
                    message below and I&apos;ll get back to you soon.
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="relative space-y-4 sm:space-y-5"
                >
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="group">
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-5 py-4 rounded-xl bg-[#e6ffe4] border border-green-300/40 text-black text-base [font-family:'Inter',Helvetica] placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-green-400/80 focus:border-transparent transition-all duration-300 hover:border-green-400/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.08)]"
                      />
                    </div>
                    <div className="group">
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-5 py-4 rounded-xl bg-[#e6ffe4] border border-green-300/40 text-black text-base [font-family:'Inter',Helvetica] placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-green-400/80 focus:border-transparent transition-all duration-300 hover:border-green-400/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.08)]"
                      />
                    </div>
                  </div>

                  {/* Description textarea */}
                  <textarea
                    name="description"
                    placeholder="Your Message"
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-5 py-4 rounded-xl bg-[#e6ffe4] border border-green-300/40 text-black text-base [font-family:'Inter',Helvetica] placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-green-400/80 focus:border-transparent resize-none transition-all duration-300 hover:border-green-400/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.08)]"
                  />

                  {/* hCaptcha + Submit row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
                    {/* hCaptcha widget container */}
                    <div ref={hcaptchaContainerRef} className="flex-shrink-0" />

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={formStatus === "loading"}
                      className="w-full sm:w-auto px-10 sm:px-12 py-3.5 sm:py-4 rounded-xl bg-white text-black [font-family:'Inter',Helvetica] font-semibold text-lg hover:bg-green-50 hover:shadow-lg hover:shadow-green-300/20 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2.5"
                    >
                      {formStatus === "loading" ? (
                        <>
                          <svg
                            className="animate-spin w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>

                  {/* Status message */}
                  {formMessage && (
                    <div
                      className={`mt-2 p-4 rounded-xl text-center [font-family:'Inter',Helvetica] font-medium text-[15px] transition-all duration-300 ${
                        formStatus === "success"
                          ? "bg-green-100/90 text-green-800 border border-green-200"
                          : "bg-red-50/90 text-red-700 border border-red-200"
                      }`}
                      role="alert"
                      aria-live="polite"
                    >
                      {formMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="relative py-8 border-t border-gray-100 bg-[#B2FCAC]/75">
        <hr
          style={{
            color: "#000000",
            height: "2px",
            
          }}
          className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-8 lg:mb-6 bg-green-500"
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-row items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <a
            href="#home"
            className="[font-family:'Inter',Helvetica] font-medium italic text-base sm:text-lg text-black/70 hover:text-green-700 transition-colors duration-300"
          >
            Handika Akbar
          </a>
          <p className="[font-family:'Inter',Helvetica] font-normal text-black/40 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Handika Akbar. All rights
            reserved.
          </p>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  LIGHTBOX MODAL                                              */}
      {/* ============================================================ */}
      {activeProject && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 animate-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveProject(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveProject(null)}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center hover:scale-105 hover:rotate-90 transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Close image popup"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Modal Container */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center p-2 animate-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeProject.image}
              alt={activeProject.imageAlt}
              className="max-w-full max-h-[72vh] rounded-xl object-contain shadow-2xl border border-white/10"
            />
            {/* Caption */}
            <div className="mt-5 text-center text-white max-w-[80vw]">
              <h3 className="[font-family:'Inter',Helvetica] font-semibold text-lg sm:text-xl md:text-2xl">
                {activeProject.title}
              </h3>
              <p className="mt-1.5 [font-family:'Inter',Helvetica] font-medium text-white/60 text-xs sm:text-sm md:text-base">
                {activeProject.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  SCROLL-TO-TOP BUTTON                                         */}
      {/* ============================================================ */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-600/30 flex items-center justify-center transition-all duration-500 hover:shadow-xl hover:shadow-green-500/40 hover:scale-110 active:scale-95 ${
          scrolled
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </div>
  );
};
