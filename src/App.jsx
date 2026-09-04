import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import AOS from "aos";
import "aos/dist/aos.css";
import { profileData } from "./data/profileData";
import {
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaDownload,
  FaCode,
  FaBrain,
  FaRocket,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaPhoneAlt,
} from "react-icons/fa";

export default function App() {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [projectIndex, setProjectIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(2);
  const [navOpen, setNavOpen] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleText, setRoleText] = useState("");
  const featuredProjects = profileData.projects;
  const maxIndex = Math.max(0, featuredProjects.length - slidesPerView);
  const roles = Array.isArray(profileData.role) ? profileData.role : [profileData.role];
  const currentRole = roles[roleIndex % roles.length] || "";
  const primaryRole = roles[0] || "";
  const swipeStateRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    isSwiping: false,
  });

  useEffect(() => {
    AOS.init({ duration: 900, once: true });

    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      const bar = document.getElementById("progress-bar");
      if (bar) bar.style.width = `${scrollPercent}%`;
      setShowTop(scrollTop > 400);
    };

    window.addEventListener("scroll", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSlidesPerView(window.innerWidth < 900 ? 1 : 2);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!currentRole) return;
    let timeoutId;
    const typingSpeed = 80;
    const pauseAfterFull = 900;

    const typeNext = (index) => {
      if (index <= currentRole.length) {
        setRoleText(currentRole.slice(0, index));
        timeoutId = setTimeout(() => typeNext(index + 1), typingSpeed);
      } else {
        timeoutId = setTimeout(() => {
          setRoleIndex((prev) => (prev + 1) % roles.length);
          setRoleText("");
        }, pauseAfterFull);
      }
    };

    typeNext(0);
    return () => clearTimeout(timeoutId);
  }, [currentRole, roles.length]);

  useEffect(() => {
    if (projectIndex > maxIndex) {
      setProjectIndex(maxIndex);
    }
  }, [maxIndex, projectIndex]);

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      alert("Email service is not configured yet.");
      return;
    }

    setLoading(true);
    try {
      await emailjs.send(
        serviceId,
        templateId,
        data,
        publicKey
      );
      alert("Message sent successfully!");
      reset();
    } catch (err) {
      alert("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  const goPrevProject = () => {
    setProjectIndex((prev) => Math.max(0, prev - 1));
  };
  const goNextProject = () => {
    setProjectIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    swipeStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      isSwiping: false,
    };
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (!touch) return;

    const state = swipeStateRef.current;
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    if (!state.isSwiping) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        state.isSwiping = true;
      } else if (Math.abs(deltaY) > 10) {
        return;
      }
    }

    if (state.isSwiping) {
      event.preventDefault();
      state.lastX = touch.clientX;
    }
  };

  const handleTouchEnd = () => {
    const { startX, lastX, isSwiping } = swipeStateRef.current;
    if (!isSwiping) return;

    const deltaX = lastX - startX;
    const threshold = 50;

    if (deltaX <= -threshold && projectIndex < maxIndex) {
      setProjectIndex((prev) => Math.min(maxIndex, prev + 1));
      return;
    }
    if (deltaX >= threshold && projectIndex > 0) {
      setProjectIndex((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className="progress">
        <div id="progress-bar" className="progress__bar" />
      </div>
      <header className="site-header">
        <nav className="nav" aria-label="Main navigation">
          <div className="logo logo--typing">
            <span>&lt; Muskan.dev /&gt;</span>
          </div>
          <button
            type="button"
            className={`nav__toggle ${navOpen ? "is-open" : ""}`}
            aria-label="Toggle navigation menu"
            aria-controls="primary-navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((prev) => !prev)}
          >
            <span className="nav__glyph" aria-hidden="true">
              {navOpen ? "✕" : "☰"}
            </span>
          </button>
          <ul className={`nav__links ${navOpen ? "is-open" : ""}`} id="primary-navigation">
            <li><a href="#about" onClick={() => setNavOpen(false)}>About</a></li>
            <li><a href="#skills" onClick={() => setNavOpen(false)}>Stack</a></li>
            <li><a href="#projects" onClick={() => setNavOpen(false)}>Projects</a></li>
            <li><a href="#experience" onClick={() => setNavOpen(false)}>Experience</a></li>
            <li><a href="#contact" onClick={() => setNavOpen(false)}>Contact</a></li>
            <li className="nav__resume nav__resume--mobile">
              <a href={profileData.resume} download onClick={() => setNavOpen(false)}>
                <FaDownload aria-hidden="true" /> Resume
              </a>
            </li>
          </ul>
          <a className="btn btn--ghost nav__resume" href={profileData.resume} download>
            <FaDownload aria-hidden="true" /> Resume
          </a>
        </nav>
      </header>
      <main id="main">
        <section id="hero" className="hero" aria-labelledby="hero-heading">
          <div className="container hero__content">
            <div className="hero__text" data-aos="fade-up">
              <div className="pill fade-up">
                <FaMapMarkerAlt aria-hidden="true" />
                <span>{profileData.location}</span>
              </div>
              <h1 id="hero-heading" className="hero-text fade-up">
                <span className="hero-name">{profileData.name}</span>
                <span className="accent accent--inline role-rotator">
                  {roleText}
                </span>
              </h1>
              <p className="hero-subtitle fade-up">{profileData.tagline}</p>
              <div className="hero__actions fade-up">
                <a className="btn" href="#projects">
                  <FaRocket aria-hidden="true" /> View Work
                </a>
                <a className="btn btn--ghost" href="#contact">
                  <FaEnvelope aria-hidden="true" /> Let’s talk
                </a>
              </div>
              <div className="hero__stats fade-up">
                {profileData.stats.map((stat) => (
                  <div key={stat.label} className="stat">
                    <div className="stat__value">{stat.value}</div>
                    <div className="stat__label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero__card lift" data-aos="zoom-in">
              <img
                src="/WhatsApp Image 2025-10-23 at 17.50.11_607622d6.jpg"
                alt="Portrait of Muskan"
                loading="lazy"
              />
              <div className="hero__card__body">
                <div className="hero__role">{primaryRole}</div>
                <p>{profileData.about}</p>
                <ul className="hero__highlights">
                  {profileData.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section" aria-labelledby="about-heading">
          <div className="container">
            <div className="section__header">
              <h2 id="about-heading"><FaUser aria-hidden="true" /> About Me</h2>
              <p>I care about clean systems, delightful UX, and measurable impact. Here’s how I work.</p>
            </div>
            <div className="about-grid">
              {profileData.aboutBlocks.map((block, index) => (
                <div
                  key={block.title}
                  className="about-card profile-box"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <h3>{block.title}</h3>
                  <p>{block.text}</p>
                </div>
              ))}
            </div>
            <p className="tech-dna">{profileData.techDna}</p>
          </div>
        </section>

        <section id="skills" className="section section--alt" aria-labelledby="skills-heading">
          <div className="container">
            <div className="section__header">
              <h2 id="skills-heading"><FaCode aria-hidden="true" /> Tech Stack</h2>
              <p>Clean, production-ready stack with solid CS foundations.</p>
            </div>
            <div className="stack-grid">
              {profileData.skills.map((group) => (
                <div key={group.title} className="stack-card" data-aos="fade-up">
                  <h3>{group.title}</h3>
                  <div className="chip-row">
                    {group.items.map((skill) => (
                      <span key={skill.name} className={`chip ${skill.level}`}>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="stack-proof-grid">
              <div className="stack-proof-card">
                <h3>Stack in Action</h3>
                <ul>
                  {profileData.stackInAction.map((item) => (
                    <li key={item.project}>
                      <strong>{item.project}:</strong> {item.stack}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="stack-proof-card">
                <h3>Proof of Impact</h3>
                <ul>
                  {profileData.skillProof.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section" aria-labelledby="projects-heading">
          <div className="container">
            <div className="section__header">
              <h2 id="projects-heading"><FaBriefcase aria-hidden="true" /> Featured Projects</h2>
              <p>Product-driven builds with measurable results.</p>
            </div>
            <div className="carousel" role="region" aria-label="Featured projects carousel">
              <div className="carousel__header">
                <span className="featured-badge">Featured Projects</span>
                <div className="carousel__controls">
                  <button
                    type="button"
                    className={`btn btn--ghost btn--small ${projectIndex === 0 ? "is-hidden" : ""}`}
                    onClick={goPrevProject}
                    aria-label="Previous project"
                    disabled={projectIndex === 0}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`btn btn--ghost btn--small ${projectIndex === maxIndex ? "is-hidden" : ""}`}
                    onClick={goNextProject}
                    aria-label="Next project"
                    disabled={projectIndex === maxIndex}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div
                className="carousel__viewport"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <div
                  className="carousel__track"
                  style={{ transform: `translateX(-${projectIndex * (100 / slidesPerView)}%)` }}
                >
                  {featuredProjects.map((project, index) => (
                    <div
                      key={index}
                      className="carousel__slide"
                      role="listitem"
                      aria-label={`Project: ${project.name}`}
                    >
                      <div className="project-card lift">
                        <img
                          src={project.image}
                          alt={`${project.name} preview`}
                          className="project-thumb"
                          loading="lazy"
                        />
                        <div className="project-card__header">
                          <h3>{project.name}</h3>
                          <span className="project-role">{project.role}</span>
                        </div>
                        <p className="muted"><strong>Problem:</strong> {project.problem}</p>
                        <p><strong>Solution:</strong> {project.solution}</p>
                        <p><strong>Impact:</strong> {project.impact}</p>
                        <div className="chip-row">
                          {project.tech.map((tech) => (
                            <span key={tech} className="chip chip--ghost">{tech}</span>
                          ))}
                        </div>
                        <div className="project-actions">
                          {project.demo && project.demo !== "#" ? (
                            <a
                              href={project.demo}
                              className="btn btn--small"
                              aria-label={`Open live demo for ${project.name}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FaExternalLinkAlt aria-hidden="true" /> {project.demoLabel || "Live Demo"}
                            </a>
                          ) : (
                            <button
                              type="button"
                              className="btn btn--small"
                              aria-label={`Demo for ${project.name} will be uploaded soon`}
                              disabled
                            >
                              <FaExternalLinkAlt aria-hidden="true" /> {project.demoLabel || "Demo"}
                            </button>
                          )}
                          <a href={project.repo} className="btn btn--ghost btn--small" aria-label={`View repository for ${project.name}`}>
                            <FaGithub aria-hidden="true" /> Code
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="carousel__dots" role="tablist" aria-label="Project slides">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`carousel__dot ${idx === projectIndex ? "is-active" : ""}`}
                    onClick={() => setProjectIndex(idx)}
                    aria-label={`Go to project ${idx + 1}`}
                    aria-selected={idx === projectIndex}
                    role="tab"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="section section--alt" aria-labelledby="why-heading">
          <div className="container">
            <div className="section__header">
              <h2 id="why-heading">Why Hire Me?</h2>
              <p>Clear strengths that translate to shipping impact quickly.</p>
            </div>
            <div className="why-grid">
              <div className="why-card lift profile-box" data-aos="fade-up">
                <h3>Full-Stack Delivery</h3>
                <p>Hands-on MERN experience with clean architecture and reliable CRUD flows.</p>
              </div>
              <div className="why-card lift profile-box" data-aos="fade-up" data-aos-delay="100">
                <h3>Performance Mindset</h3>
                <p>Optimized database queries and UI performance to improve real-world outcomes.</p>
              </div>
              <div className="why-card lift profile-box" data-aos="fade-up" data-aos-delay="200">
                <h3>Strong CS Core</h3>
                <p>Solid DSA foundation and problem-solving approach for scalable systems.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="github" className="section" aria-labelledby="github-heading">
          <div className="container">
            <div className="section__header">
              <h2 id="github-heading">Coding Profiles</h2>
              <p>Clean links to my strongest programming profiles.</p>
            </div>
            <div className="snapshot-grid">
              <div className="snapshot-card lift" data-aos="fade-up">
                <h3>GitHub</h3>
                <p className="muted">@techmuskan</p>
                <a className="btn btn--ghost btn--small" href={profileData.contact.github}>
                  View Profile
                </a>
              </div>
              <div className="snapshot-card lift" data-aos="fade-up" data-aos-delay="100">
                <h3>LeetCode</h3>
                <p className="muted">ID: 7iHcre53wg</p>
                <a className="btn btn--ghost btn--small" href={profileData.contact.leetcode}>
                  View Profile
                </a>
              </div>
              <div className="snapshot-card lift" data-aos="fade-up" data-aos-delay="200">
                <h3>HackerRank</h3>
                <p className="muted">@kawadkarmuskan4</p>
                <a className="btn btn--ghost btn--small" href={profileData.contact.hackerrank}>
                  View Profile
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="section section--alt">
          <div className="container">
            <div className="section__header">
              <h2><FaBriefcase /> Experience</h2>
              <p>Roles where I shipped features, optimized systems, and delivered impact.</p>
            </div>
            <div className="timeline">
              {profileData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="timeline__item fade-up"
                >
                  <div className="timeline__dot" />
                  <div className="timeline__content">
                    <div className="timeline__title">
                      <h3 className="experience-title">{exp.title}</h3>
                      <span>{exp.company}</span>
                    </div>
                    <p className="muted"><FaCalendarAlt /> {exp.duration}</p>
                    <p>{exp.responsibilities}</p>
                    <p><strong>Achievements:</strong> {exp.achievements}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="education" className="section">
          <div className="container">
            <div className="section__header">
              <h2><FaGraduationCap /> Education</h2>
              <p>Foundational CS training with applied AI + web engineering.</p>
            </div>
            <div className="edu-grid">
              {profileData.education.map((edu, index) => (
                <div
                  key={index}
                  className="edu-card lift"
                  data-aos="fade-up"
                >
                  <h3>{edu.degree}</h3>
                  <p className="muted">{edu.institution}</p>
                  <p className="muted">{edu.year}</p>
                  <p>{edu.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ai" className="section section--alt">
          <div className="container">
            <div className="section__header">
              <h2><FaBrain /> Certifications & Leadership</h2>
              <p>Proof of learning, impact, and responsibility beyond the classroom.</p>
            </div>
            <div className="ai-grid">
              <div className="ai-card ai-card--accent" data-aos="fade-up">
                <h3>Certifications</h3>
                <ul className="list">
                  {profileData.certifications.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="ai-card" data-aos="fade-up">
                <h3>Achievements</h3>
                <ul className="list">
                  {profileData.achievements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="ai-card" data-aos="fade-up">
                <h3>Leadership & Volunteering</h3>
                <ul className="list">
                  {profileData.volunteering.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="badge-pill">
                  <span>Active community involvement</span>
                </div>
              </div>
              <div className="ai-card" data-aos="fade-up">
                <h3>Microsoft Learn Student Ambassador</h3>
                <p className="muted">{profileData.ambassador.level}</p>
                <p>{profileData.ambassador.eventsHosted}</p>
                <div className="badge-row">
                  {profileData.ambassador.badges.map((badge) => (
                    <img
                      key={badge}
                      src={badge}
                      alt="Microsoft Learn Student Ambassador badge"
                      className="badge"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section" aria-labelledby="contact-heading">
          <div className="container">
            <div className="section__header">
              <h2 id="contact-heading"><FaEnvelope aria-hidden="true" /> Let’s Build</h2>
              <p>Open to internships, full-time roles, and collaborative projects.</p>
            </div>
            <div className="contact-grid">
              <div className="contact-card" data-aos="fade-up">
                <h3>Get In Touch</h3>
                <p>Tell me about your project or role. I respond within 24–48 hours.</p>
                <div className="contact-actions">
                  <a href={`mailto:${profileData.contact.email}`} className="btn" aria-label="Send email to Muskan">
                    <FaEnvelope aria-hidden="true" /> Email
                  </a>
                  <a href={profileData.contact.linkedin} className="btn btn--ghost" aria-label="Visit LinkedIn profile">
                    <FaLinkedin aria-hidden="true" /> LinkedIn
                  </a>
                  <a href={profileData.contact.github} className="btn btn--ghost" aria-label="Visit GitHub profile">
                    <FaGithub aria-hidden="true" /> GitHub
                  </a>
                  <a href={profileData.contact.leetcode} className="btn btn--ghost" aria-label="Visit LeetCode profile">
                    <FaCode aria-hidden="true" /> LeetCode
                  </a>
                  <a href={profileData.contact.hackerrank} className="btn btn--ghost" aria-label="Visit HackerRank profile">
                    <FaCode aria-hidden="true" /> HackerRank
                  </a>
                  <a href={profileData.contact.youtube} className="btn btn--ghost" aria-label="Visit YouTube channel">
                    <FaYoutube aria-hidden="true" /> YouTube
                  </a>
                  <a href={profileData.contact.instagram} className="btn btn--ghost" aria-label="Visit Instagram profile">
                    <FaInstagram aria-hidden="true" /> Instagram
                  </a>
                </div>
                <div className="contact-meta">
                  <FaPhoneAlt aria-hidden="true" />
                  <a className="phone-link" href={`tel:${profileData.phone.replace(/\s/g, "")}`}>
                    {profileData.phone}
                  </a>
                </div>
              </div>
              <form
                ref={formRef}
                onSubmit={handleSubmit(onSubmit)}
                className="contact-form"
                aria-labelledby="contact-form"
                data-aos="fade-up"
              >
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input {...register("name")} id="name" placeholder="Your Name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="subject">Subject</label>
                    <input {...register("subject")} id="subject" placeholder="Subject" required />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input {...register("email")} id="email" type="email" placeholder="Your Email" required />
                </div>

                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea {...register("message")} id="message" placeholder="Your Message" rows="5" required />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      {showTop && (
        <button
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
      <footer className="site-footer">
        <p>
          &copy; 2026 {profileData.name} ·{" "}
          <a href={profileData.contact.github}>GitHub</a> ·{" "}
          <a href={profileData.contact.linkedin}>LinkedIn</a> ·{" "}
          <a href={profileData.contact.leetcode}>LeetCode</a>
        </p>
        <p className="muted">All information above is true and verified by me.</p>
      </footer>
    </>
  );
}
