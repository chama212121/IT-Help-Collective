import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  Video,
  Mail,
  Home,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Lock,
  Laptop,
  Smartphone,
  Wifi,
  Printer,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import { supabase } from "./supabaseClient";

const CONTACT_METHODS = [
  { id: "phone", label: "Phone call", icon: Phone },
  { id: "video", label: "Video call", icon: Video },
  { id: "email", label: "Email", icon: Mail },
  { id: "in_person", label: "In person", icon: Home },
];

const URGENCY_LEVELS = [
  { id: "low", label: "Whenever someone is available" },
  { id: "medium", label: "Within a few days" },
  { id: "high", label: "As soon as possible" },
];

const STATUS = {
  open: {
    label: "New",
    color: "var(--amber)",
  },
  in_progress: {
    label: "In progress",
    color: "var(--teal)",
  },
  resolved: {
    label: "Resolved",
    color: "var(--slate)",
  },
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);

  return `${days}d ago`;
}

function NodeMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <line
        x1="10"
        y1="30"
        x2="20"
        y2="10"
        stroke="var(--teal)"
        strokeWidth="2"
      />

      <line
        x1="20"
        y1="10"
        x2="30"
        y2="30"
        stroke="var(--teal)"
        strokeWidth="2"
      />

      <line
        x1="10"
        y1="30"
        x2="30"
        y2="30"
        stroke="var(--teal)"
        strokeWidth="2"
        opacity="0.5"
      />

      <circle cx="10" cy="30" r="4" fill="var(--ink)" />
      <circle cx="30" cy="30" r="4" fill="var(--ink)" />
      <circle cx="20" cy="10" r="4.5" fill="var(--teal)" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState("public");

  function goHome() {
    setView("public");

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand brand-button" onClick={goHome}>
          <NodeMark />
          <span className="brand-name">Digital Reach</span>
        </button>

        <nav className="tabs">
          <button
            className={`tab ${view === "public" ? "tab-active" : ""}`}
            onClick={goHome}
          >
            Get help
          </button>

          <button
            className={`tab ${view === "volunteer" ? "tab-active" : ""}`}
            onClick={() => setView("volunteer")}
          >
            Volunteer portal
          </button>
        </nav>
      </header>

      {view === "public" && (
        <PublicView
          onOpenPrivacy={() => setView("privacy")}
          onOpenSafety={() => setView("safety")}
        />
      )}

      {view === "volunteer" && <VolunteerView />}

      {view === "privacy" && <PrivacyView onBack={goHome} />}

      {view === "safety" && <SafetyView onBack={goHome} />}

      <footer className="foot">
        <div className="footer-inner">
          <div>
            <strong>Digital Reach</strong>
            <span>Free technology help from real people.</span>
          </div>

          <div className="footer-links">
            <button
              className="footer-link"
              onClick={() => setView("privacy")}
            >
              Privacy
            </button>

            <span>•</span>

            <button
              className="footer-link"
              onClick={() => setView("safety")}
            >
              Safety
            </button>

            <span>•</span>

            <span>Always free</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PublicView({ onOpenPrivacy, onOpenSafety }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod] = useState("phone");
  const [urgency, setUrgency] = useState("low");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const valid =
    name.trim() &&
    contact.trim() &&
    description.trim().length > 4;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!valid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("tickets")
        .insert([
          {
            name: name.trim(),
            contact: contact.trim(),
            method,
            urgency,
            description: description.trim(),
            status: "open",
          },
        ]);

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong sending your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="public-page">
        <section className="success-card">
          <div className="success-icon">
            <CheckCircle2 size={48} />
          </div>

          <span className="eyebrow">REQUEST RECEIVED</span>

          <h2>We've received your request.</h2>

          <p>
            Thanks, {name.split(" ")[0]}. We'll contact you using your
            preferred method.
          </p>

          <p className="muted">
            You don't need to do anything else for now.
          </p>

          <button
            className="btn-primary"
            onClick={() => {
              setSubmitted(false);
              setName("");
              setContact("");
              setDescription("");
              setMethod("phone");
              setUrgency("low");
              setError("");

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            Submit another request
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="public-page">
      <section className="hero-new">
        <div className="hero-badge">
          <HeartHandshake size={16} />
          Free community technology support
        </div>

        <h1>
          Free tech help,
          <br />
          from real people.
        </h1>

        <p>
          Having trouble with your computer, phone, Wi-Fi or technology?
          Tell us what's happening and we'll help you work it out.
        </p>

        <div className="hero-buttons">
          <button
            className="btn-primary btn-hero"
            onClick={() =>
              document
                .getElementById("request-help")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Get free help
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="hero-trust">
          <span>✓ Always free</span>
          <span>✓ No judgement</span>
          <span>✓ No technical knowledge needed</span>
        </div>
      </section>

      <section className="help-section">
        <div className="section-heading">
          <span className="eyebrow">HOW WE CAN HELP</span>

          <h2>Technology problems big or small.</h2>

          <p>
            You don't need to know the technical terms. Just tell us
            what's happening.
          </p>
        </div>

        <div className="help-grid">
          <div className="help-card">
            <div className="help-icon">
              <Laptop size={25} />
            </div>

            <h3>Computers</h3>

            <p>
              Slow computers, software, updates, files and settings.
            </p>
          </div>

          <div className="help-card">
            <div className="help-icon">
              <Smartphone size={25} />
            </div>

            <h3>Phones & tablets</h3>

            <p>
              Apps, photos, settings, accounts and everyday problems.
            </p>
          </div>

          <div className="help-card">
            <div className="help-icon">
              <Wifi size={25} />
            </div>

            <h3>Internet & Wi-Fi</h3>

            <p>
              Connection problems, Wi-Fi setup and internet issues.
            </p>
          </div>

          <div className="help-card">
            <div className="help-icon">
              <Printer size={25} />
            </div>

            <h3>Printers & devices</h3>

            <p>
              Printers, scanners, webcams and other technology.
            </p>
          </div>

          <div className="help-card">
            <div className="help-icon">
              <ShieldCheck size={25} />
            </div>

            <h3>Online safety</h3>

            <p>
              Scams, suspicious emails, phishing and account security.
            </p>
          </div>

          <div className="help-card">
            <div className="help-icon">
              <GraduationCap size={25} />
            </div>

            <h3>Learning technology</h3>

            <p>
              We'll patiently show you how to use your technology.
            </p>
          </div>
        </div>
      </section>

      <section className="request-section" id="request-help">
        <div className="section-heading">
          <span className="eyebrow">GET HELP</span>

          <h2>Tell us what you're having trouble with.</h2>

          <p>
            Don't worry about using technical words. Explain the
            problem in your own words and we'll take it from there.
          </p>
        </div>

        <form className="card request-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Your name</span>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="For example, Jane Smith"
              autoComplete="name"
            />
          </label>

          <label className="field">
            <span>Phone number or email</span>

            <span className="field-help">
              So we can contact you about your support request.
            </span>

            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone number or email address"
            />
          </label>

          <div className="field">
            <span>How would you like us to help?</span>

            <div className="chip-row large-chips">
              {CONTACT_METHODS.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`chip ${
                    method === id ? "chip-active" : ""
                  }`}
                  onClick={() => setMethod(id)}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>How soon do you need help?</span>

            <div className="chip-row large-chips">
              <button
                type="button"
                className={`chip ${
                  urgency === "low" ? "chip-active" : ""
                }`}
                onClick={() => setUrgency("low")}
              >
                Whenever someone is available
              </button>

              <button
                type="button"
                className={`chip ${
                  urgency === "medium" ? "chip-active" : ""
                }`}
                onClick={() => setUrgency("medium")}
              >
                Within a few days
              </button>

              <button
                type="button"
                className={`chip ${
                  urgency === "high" ? "chip-active" : ""
                }`}
                onClick={() => setUrgency("high")}
              >
                As soon as possible
              </button>
            </div>
          </div>

          <label className="field">
            <span>Tell us what's happening</span>

            <span className="field-help">
              You can describe the problem however you like. Don't worry
              about technical terms.
            </span>

            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="For example: My laptop has become very slow and I don't know why."
            />
          </label>

          <div className="form-safety">
            <ShieldCheck size={23} />

            <div>
              <strong>Your safety comes first.</strong>

              <p>
                Please don't include passwords, banking details, PINs or
                security codes in your request.
              </p>

              <button
                type="button"
                className="inline-policy-link"
                onClick={onOpenSafety}
              >
                Read our safety information
              </button>
            </div>
          </div>

          <div className="privacy-notice">
            <Lock size={18} />

            <p>
              By submitting this form, you understand that Digital Reach
              will use the information you provide to contact you and help
              with your technology support request.{" "}

              <button
                type="button"
                className="inline-policy-link"
                onClick={onOpenPrivacy}
              >
                Read our Privacy Policy
              </button>
            </p>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            className="btn-primary btn-large"
            type="submit"
            disabled={!valid || submitting}
          >
            {submitting ? (
              <Loader2 className="spin" size={18} />
            ) : null}

            {submitting ? "Sending request..." : "Get free help"}
          </button>
        </form>

        <div className="alternative-help">
          <MessageCircle size={23} />

          <div>
            <strong>Not comfortable filling out a form?</strong>

            <p>
              That's completely okay. We want technology help to be
              accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="section-heading">
          <span className="eyebrow">HOW IT WORKS</span>

          <h2>Getting help is simple.</h2>
        </div>

        <div className="how-grid">
          <div className="how-card">
            <div className="how-number">1</div>

            <h3>Tell us about the problem</h3>

            <p>
              Submit a short request describing what you're experiencing.
            </p>
          </div>

          <div className="how-card">
            <div className="how-number">2</div>

            <h3>We contact you</h3>

            <p>
              We'll contact you using your preferred method to understand
              the problem.
            </p>
          </div>

          <div className="how-card">
            <div className="how-number">3</div>

            <h3>We solve it together</h3>

            <p>
              We'll help you fix the problem or show you how to do it
              yourself.
            </p>
          </div>
        </div>
      </section>

      <section className="safety-section">
        <div className="safety-heading">
          <ShieldCheck size={36} />

          <div>
            <span className="eyebrow">YOUR SAFETY MATTERS</span>

            <h2>Help without the pressure.</h2>
          </div>
        </div>

        <div className="safety-grid">
          <div>
            <strong>We never need your password.</strong>

            <p>
              You should always keep your passwords private.
            </p>
          </div>

          <div>
            <strong>We never ask for banking details.</strong>

            <p>
              Your financial information stays yours.
            </p>
          </div>

          <div>
            <strong>We never charge for help.</strong>

            <p>
              Digital Reach is a free community service.
            </p>
          </div>

          <div>
            <strong>You stay in control.</strong>

            <p>
              We'll explain what we're doing before we do it.
            </p>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <h2>Need help with technology?</h2>

        <p>
          You don't have to figure it out alone.
        </p>

        <button
          className="btn-primary btn-large"
          onClick={() =>
            document
              .getElementById("request-help")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >
          Get free help
          <ArrowRight size={18} />
        </button>
      </section>
    </main>
  );
}

function VolunteerView() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    setSigningIn(true);
    setError("");

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setError(
        "That email or password didn't work. Check your details and try again."
      );
    }

    setSigningIn(false);
  }

  if (checking) {
    return (
      <main className="portal-page">
        <div className="center-loading">
          <Loader2 className="spin" size={24} />
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="portal-page">
        <form className="card gate" onSubmit={handleLogin}>
          <div className="gate-icon">
            <Lock size={28} />
          </div>

          <span className="eyebrow">VOLUNTEERS</span>

          <h2>Volunteer sign-in</h2>

          <p className="muted">
            This queue contains people's contact details, so only
            authorised users can log in.
          </p>

          <label className="field">
            <span>Email</span>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button
            className="btn-primary"
            type="submit"
            disabled={!email || !password || signingIn}
          >
            {signingIn ? (
              <Loader2 className="spin" size={17} />
            ) : null}

            {signingIn ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  const displayName =
    session.user.user_metadata?.display_name ||
    session.user.email.split("@")[0];

  return (
    <Queue
      volunteerName={displayName}
      onSwitchUser={() => supabase.auth.signOut()}
    />
  );
}

function Queue({ volunteerName, onSwitchUser }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) throw fetchError;

      setTickets(data || []);
    } catch {
      setError(
        "Couldn't load the queue. Check your connection and try refreshing."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateTicket(id, patch) {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...patch,
            }
          : ticket
      )
    );

    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update(patch)
        .eq("id", id);

      if (updateError) throw updateError;
    } catch {
      setError(
        "Couldn't save that change. Check your connection and try again."
      );

      load();
    }
  }

  const filtered = tickets.filter(
    (ticket) => filter === "all" || ticket.status === filter
  );

  const counts = tickets.reduce(
    (acc, ticket) => ({
      ...acc,
      [ticket.status]: (acc[ticket.status] || 0) + 1,
    }),
    {}
  );

  return (
    <main className="portal-page">
      <div className="queue-head">
        <div>
          <span className="eyebrow">VOLUNTEER PORTAL</span>

          <h2 className="queue-title">Help requests</h2>

          <p className="muted">
            Signed in as <strong>{volunteerName}</strong>
            {" · "}
            <button className="link-btn" onClick={onSwitchUser}>
              log out
            </button>
          </p>
        </div>

        <button className="btn-ghost" onClick={load}>
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="filter-row">
        {[
          {
            id: "open",
            label: `New (${counts.open || 0})`,
          },
          {
            id: "in_progress",
            label: `In progress (${counts.in_progress || 0})`,
          },
          {
            id: "resolved",
            label: `Resolved (${counts.resolved || 0})`,
          },
          {
            id: "all",
            label: "All",
          },
        ].map((f) => (
          <button
            key={f.id}
            className={`chip ${
              filter === f.id ? "chip-active" : ""
            }`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="portal-error">{error}</div>}

      {loading ? (
        <div className="center-loading">
          <Loader2 className="spin" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <CheckCircle2 size={34} />

          <strong>Nothing here right now.</strong>

          <span>New requests will appear here.</span>
        </div>
      ) : (
        <ul className="ticket-list">
          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              expanded={expandedId === ticket.id}
              onToggle={() =>
                setExpandedId(
                  expandedId === ticket.id ? null : ticket.id
                )
              }
              onUpdate={(patch) =>
                updateTicket(ticket.id, patch)
              }
              volunteerName={volunteerName}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

function TicketCard({
  ticket,
  expanded,
  onToggle,
  onUpdate,
  volunteerName,
}) {
  const [notes, setNotes] = useState(ticket.notes || "");

  const methodInfo = CONTACT_METHODS.find(
    (method) => method.id === ticket.method
  );

  const Icon = methodInfo ? methodInfo.icon : Phone;

  const urgencyInfo = URGENCY_LEVELS.find(
    (urgency) => urgency.id === ticket.urgency
  );

  const statusInfo = STATUS[ticket.status];

  return (
    <li className="ticket-card">
      <button className="ticket-summary" onClick={onToggle}>
        <span
          className="status-dot"
          style={{
            background: statusInfo?.color || "var(--slate)",
          }}
        />

        <span className="ticket-name">{ticket.name}</span>

        <span className="ticket-desc">{ticket.description}</span>

        {ticket.urgency === "high" && (
          <span className="badge-urgent">Urgent</span>
        )}

        <span className="ticket-time">
          {timeAgo(ticket.created_at)}
        </span>

        {expanded ? (
          <ChevronUp size={17} />
        ) : (
          <ChevronDown size={17} />
        )}
      </button>

      {expanded && (
        <div className="ticket-body">
          <div className="detail-grid">
            <div>
              <span className="detail-label">Contact</span>
              <span>{ticket.contact}</span>
            </div>

            <div>
              <span className="detail-label">
                Preferred method
              </span>

              <span className="inline-icon">
                <Icon size={14} />
                {methodInfo?.label}
              </span>
            </div>

            <div>
              <span className="detail-label">How soon</span>
              <span>{urgencyInfo?.label}</span>
            </div>

            <div>
              <span className="detail-label">Submitted</span>

              <span>
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <span className="detail-label">Problem</span>

            <p className="full-desc">
              {ticket.description}
            </p>
          </div>

          <div className="action-row">
            {!ticket.claimed_by ? (
              <button
                className="btn-primary small"
                onClick={() =>
                  onUpdate({
                    claimed_by: volunteerName,
                    status: "in_progress",
                  })
                }
              >
                Claim this ticket
              </button>
            ) : (
              <span className="claimed-by">
                Claimed by {ticket.claimed_by}
              </span>
            )}

            <select
              value={ticket.status}
              onChange={(e) =>
                onUpdate({
                  status: e.target.value,
                })
              }
              className="status-select"
            >
              {Object.entries(STATUS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <label className="field">
            <span>Notes</span>

            <span className="field-help">
              Keep track of what's been tried or what needs to happen next.
            </span>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() =>
                onUpdate({
                  notes,
                })
              }
              placeholder="What's been tried, what's next..."
            />
          </label>
        </div>
      )}
    </li>
  );
}

function PrivacyView({ onBack }) {
  return (
    <main className="policy-page">
      <button className="policy-back" onClick={onBack}>
        ← Back to Digital Reach
      </button>

      <div className="policy-card">
        <span className="eyebrow">DIGITAL REACH</span>

        <h1>Privacy Policy</h1>

        <p className="policy-updated">
          Last updated: August 2026
        </p>

        <section>
          <h2>1. About Digital Reach</h2>

          <p>
            Digital Reach provides free community technology support
            to people who need assistance with computers, phones,
            internet services and other technology.
          </p>
        </section>

        <section>
          <h2>2. Information we collect</h2>

          <p>
            When you submit a help request, Digital Reach may collect:
          </p>

          <ul>
            <li>Your name</li>
            <li>Your phone number or email address</li>
            <li>Your preferred contact method</li>
            <li>How soon you need assistance</li>
            <li>
              Information you provide about your technology problem
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Why we collect this information</h2>

          <p>
            We collect this information so that Digital Reach can
            receive, manage and respond to your technology support
            request.
          </p>

          <p>
            Your contact information allows us to communicate with
            you about the request you submitted.
          </p>
        </section>

        <section>
          <h2>4. Who can access your information</h2>

          <p>
            Support request information is intended to be accessible
            only to people authorised to manage Digital Reach support
            requests.
          </p>

          <p>
            Digital Reach does not sell your personal information.
          </p>
        </section>

        <section>
          <h2>5. Sensitive information</h2>

          <div className="policy-warning">
            <ShieldCheck size={22} />

            <div>
              <strong>
                Do not submit passwords or financial information.
              </strong>

              <p>
                Please never include passwords, PINs, banking details,
                card information, authentication codes or security
                codes in a Digital Reach support request.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>6. Keeping information secure</h2>

          <p>
            Digital Reach uses access controls and authentication to
            restrict access to support request information.
          </p>

          <p>
            No online system can guarantee absolute security, but we
            take reasonable steps to protect information provided
            through Digital Reach.
          </p>
        </section>

        <section>
          <h2>7. Correcting or deleting your information</h2>

          <p>
            You may contact Digital Reach if you would like to ask
            about information associated with your support request,
            request a correction, or request deletion where
            appropriate.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>

          <p>
            If you have a question about privacy or how Digital Reach
            handles your information, please contact Digital Reach
            using the contact details published on our website.
          </p>
        </section>

        <button
          className="btn-primary policy-bottom-button"
          onClick={onBack}
        >
          Return to Digital Reach
        </button>
      </div>
    </main>
  );
}

function SafetyView({ onBack }) {
  return (
    <main className="policy-page">
      <button className="policy-back" onClick={onBack}>
        ← Back to Digital Reach
      </button>

      <div className="policy-card">
        <span className="eyebrow">DIGITAL REACH</span>

        <h1>Staying Safe</h1>

        <p className="policy-intro">
          Digital Reach wants everyone receiving technology help to
          feel safe and remain in control.
        </p>

        <div className="safety-rule-grid">
          <div className="safety-rule">
            <Lock size={25} />

            <div>
              <h2>Keep your passwords private</h2>

              <p>
                Digital Reach will never ask you to tell us your
                password. Enter passwords yourself when required.
              </p>
            </div>
          </div>

          <div className="safety-rule">
            <ShieldCheck size={25} />

            <div>
              <h2>Never share security codes</h2>

              <p>
                Do not give anyone authentication codes, verification
                codes, PINs or account recovery codes.
              </p>
            </div>
          </div>

          <div className="safety-rule">
            <HeartHandshake size={25} />

            <div>
              <h2>Our help is free</h2>

              <p>
                Digital Reach technology support is free. You should
                not be asked to pay for Digital Reach assistance.
              </p>
            </div>
          </div>

          <div className="safety-rule">
            <Laptop size={25} />

            <div>
              <h2>You stay in control</h2>

              <p>
                You can ask what is being done to your device and you
                can stop receiving help at any time.
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2>If something feels wrong</h2>

          <p>
            Stop the conversation or support session if someone
            claiming to represent Digital Reach asks for money,
            passwords, banking information, card details or security
            codes.
          </p>

          <p>
            Do not continue with anything you are uncomfortable with.
          </p>
        </section>

        <section>
          <h2>Be careful with remote access</h2>

          <p>
            Remote access software allows another person to view or
            control parts of your computer. Make sure you understand
            why it is being used before agreeing to install or run it.
          </p>
        </section>

        <section>
          <h2>Banking and financial accounts</h2>

          <p>
            Digital Reach support should not require another person
            to access your online banking account or know your banking
            password, PIN or card security information.
          </p>
        </section>

        <div className="policy-warning">
          <ShieldCheck size={24} />

          <div>
            <strong>Remember</strong>

            <p>
              Passwords, PINs, banking details and security codes
              should stay private.
            </p>
          </div>
        </div>

        <button
          className="btn-primary policy-bottom-button"
          onClick={onBack}
        >
          Return to Digital Reach
        </button>
      </div>
    </main>
  );
}
