import { useState, useEffect, useCallback, useRef } from "react";
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
  LogOut,
  User,
  Plus,
  Send,
  History,
  LayoutDashboard,
  MessagesSquare,
  CircleUserRound,
  Clock3,
  Check,
  Menu,
  X,
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
  if (!iso) return "";

  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);

  return `${days}d ago`;
}

function formatDate(iso) {
  if (!iso) return "";

  return new Date(iso).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profile error:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
  }, []);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);

      if (data.session?.user) {
        await loadProfile(data.session.user);
      }

      setCheckingSession(false);
    }

    checkSession();

    const { data: authListener } =
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          await loadProfile(newSession.user);
        } else {
          setProfile(null);
        }
      });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  function goHome() {
    setView("public");

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 30);
  }

  async function signOut() {
    await supabase.auth.signOut();

    setView("public");
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand brand-button" onClick={goHome}>
          <NodeMark />

          <span className="brand-name">Digital Hand</span>
        </button>

        <nav className="tabs">
          <button
            className={`tab ${view === "public" ? "tab-active" : ""}`}
            onClick={goHome}
          >
            Get help
          </button>

          <button
            className={`tab ${
              view === "member" ? "tab-active" : ""
            }`}
            onClick={() => setView("member")}
          >
            {session ? "My support" : "Login"}
          </button>

          <button
            className={`tab ${
              view === "volunteer" ? "tab-active" : ""
            }`}
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
          onOpenMember={() => setView("member")}
        />
      )}

      {view === "member" && (
        <MemberArea
          session={session}
          profile={profile}
          checkingSession={checkingSession}
          reloadProfile={() =>
            session?.user && loadProfile(session.user)
          }
          onSignOut={signOut}
        />
      )}

      {view === "volunteer" && (
        <VolunteerArea
          session={session}
          profile={profile}
          checkingSession={checkingSession}
          reloadProfile={() =>
            session?.user && loadProfile(session.user)
          }
          onSignOut={signOut}
        />
      )}

      {view === "privacy" && <PrivacyView onBack={goHome} />}

      {view === "safety" && <SafetyView onBack={goHome} />}

      <footer className="foot">
        <div className="footer-inner">
          <div>
            <strong>Digital Hand</strong>
            <span>Free human tech support, wherever you are.</span>
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

/* =========================================================
   PUBLIC / NO ACCOUNT HELP
========================================================= */

function PublicView({
  onOpenPrivacy,
  onOpenSafety,
  onOpenMember,
}) {
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
            Thanks, {name.split(" ")[0]}. We'll contact you using
            your preferred method.
          </p>

          <p className="muted">
            You don't need an account for this type of support.
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
          Free human technology support
        </div>

        <h1>
          Technology problem?
          <br />
          Ask a real person.
        </h1>

        <p>
          Get patient, human help with computers, phones, Wi-Fi,
          printers and everyday technology — completely free.
        </p>

        <div className="hero-choice-grid">
          <button className="hero-choice-card" onClick={onOpenMember}>
            <div className="choice-icon">
              <MessagesSquare size={27} />
            </div>

            <div>
              <h3>Chat with a helper</h3>

              <p>
                Create an account, chat online and come back to your
                conversations later.
              </p>

              <span className="choice-link">
                Start a chat <ArrowRight size={16} />
              </span>
            </div>
          </button>

          <button
            className="hero-choice-card"
            onClick={() =>
              document
                .getElementById("request-help")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <div className="choice-icon">
              <Phone size={27} />
            </div>

            <div>
              <h3>Request help</h3>

              <p>
                No account needed. Leave your details and we'll
                contact you.
              </p>

              <span className="choice-link">
                Request help <ArrowRight size={16} />
              </span>
            </div>
          </button>
        </div>

        <div className="hero-trust">
          <span>✓ Always free</span>
          <span>✓ Real people</span>
          <span>✓ No judgement</span>
          <span>✓ No account required for basic help</span>
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
          <HelpCard
            icon={Laptop}
            title="Computers"
            text="Slow computers, software, updates, files and settings."
          />

          <HelpCard
            icon={Smartphone}
            title="Phones & tablets"
            text="Apps, photos, settings, accounts and everyday problems."
          />

          <HelpCard
            icon={Wifi}
            title="Internet & Wi-Fi"
            text="Connection problems, Wi-Fi setup and internet issues."
          />

          <HelpCard
            icon={Printer}
            title="Printers & devices"
            text="Printers, scanners, webcams and other technology."
          />

          <HelpCard
            icon={ShieldCheck}
            title="Online safety"
            text="Scams, suspicious emails, phishing and account security."
          />

          <HelpCard
            icon={GraduationCap}
            title="Learning technology"
            text="We'll patiently show you how to use your technology."
          />
        </div>
      </section>

      <section className="member-promo">
        <div>
          <span className="eyebrow">NEW: SAVED SUPPORT</span>

          <h2>Want to keep your conversation?</h2>

          <p>
            Create a free Digital Hand account to chat with helpers,
            see active support requests and revisit previous
            conversations whenever you need them.
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenMember}>
          Open my support
          <ArrowRight size={17} />
        </button>
      </section>

      <section className="request-section" id="request-help">
        <div className="section-heading">
          <span className="eyebrow">NO ACCOUNT NEEDED</span>

          <h2>Prefer us to contact you?</h2>

          <p>
            That's completely fine. Tell us what's wrong and choose
            how you'd like us to get in touch.
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
              {URGENCY_LEVELS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`chip ${
                    urgency === item.id ? "chip-active" : ""
                  }`}
                  onClick={() => setUrgency(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Tell us what's happening</span>

            <span className="field-help">
              Don't worry about technical terms.
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
                Please don't include passwords, banking details,
                PINs or security codes in your request.
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
              By submitting this form, you understand that Digital
              Hand will use the information you provide to contact
              you and assist with your support request.{" "}

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
            {submitting && <Loader2 className="spin" size={18} />}

            {submitting ? "Sending request..." : "Request free help"}
          </button>
        </form>
      </section>

      <section className="how-section">
        <div className="section-heading">
          <span className="eyebrow">HOW DIGITAL HAND WORKS</span>

          <h2>Support that doesn't disappear.</h2>
        </div>

        <div className="how-grid">
          <HowCard
            number="1"
            title="Tell us the problem"
            text="Chat online or send a normal help request without creating an account."
          />

          <HowCard
            number="2"
            title="A real person helps"
            text="A Digital Hand helper works through the problem with you."
          />

          <HowCard
            number="3"
            title="Come back anytime"
            text="Account holders can return to their saved conversations and support history."
          />
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
            <p>You should always keep your passwords private.</p>
          </div>

          <div>
            <strong>We never ask for banking details.</strong>
            <p>Your financial information stays yours.</p>
          </div>

          <div>
            <strong>We never charge for help.</strong>
            <p>Digital Hand is a free community service.</p>
          </div>

          <div>
            <strong>You stay in control.</strong>
            <p>We'll explain what we're doing before we do it.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function HelpCard({ icon: Icon, title, text }) {
  return (
    <div className="help-card">
      <div className="help-icon">
        <Icon size={25} />
      </div>

      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function HowCard({ number, title, text }) {
  return (
    <div className="how-card">
      <div className="how-number">{number}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   MEMBER AUTH
========================================================= */

function MemberArea({
  session,
  profile,
  checkingSession,
  reloadProfile,
  onSignOut,
}) {
  if (checkingSession) {
    return <LoadingPage />;
  }

  if (!session) {
    return <MemberAuth />;
  }

  if (!profile) {
    return (
      <main className="portal-page">
        <div className="card gate">
          <Loader2 className="spin" size={28} />
          <h2>Setting up your profile...</h2>

          <button className="btn-ghost" onClick={reloadProfile}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (profile.role === "helper" || profile.role === "admin") {
    return (
      <HelperChatDashboard
        session={session}
        profile={profile}
        onSignOut={onSignOut}
      />
    );
  }

  return (
    <UserDashboard
      session={session}
      profile={profile}
      onSignOut={onSignOut}
    />
  );
}

function MemberAuth() {
  const [mode, setMode] = useState("login");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setWorking(true);
    setError("");
    setNotice("");

    try {
      if (mode === "signup") {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName.trim(),
              },
            },
          });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setNotice(
            "Account created. Check your email and click the confirmation link before signing in."
          );

          setMode("login");
          setPassword("");
        }
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-intro">
        <span className="eyebrow">DIGITAL HAND ACCOUNT</span>

        <h1>Your support stays with you.</h1>

        <p>
          Log in to chat with a helper, return to ongoing
          conversations and view previous support whenever you need
          it.
        </p>

        <div className="auth-benefits">
          <span>
            <MessagesSquare size={18} />
            Saved conversations
          </span>

          <span>
            <Clock3 size={18} />
            Come back later
          </span>

          <span>
            <HeartHandshake size={18} />
            Real human support
          </span>
        </div>
      </div>

      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="auth-switch">
          <button
            type="button"
            className={mode === "login" ? "auth-switch-active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
              setNotice("");
            }}
          >
            Log in
          </button>

          <button
            type="button"
            className={mode === "signup" ? "auth-switch-active" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
              setNotice("");
            }}
          >
            Create account
          </button>
        </div>

        <h2>
          {mode === "login"
            ? "Welcome back"
            : "Create your free account"}
        </h2>

        {mode === "signup" && (
          <label className="field">
            <span>Your name</span>

            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Smith"
              required
            />
          </label>
        )}

        <label className="field">
          <span>Email</span>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </label>

        {notice && <div className="success-notice">{notice}</div>}
        {error && <div className="error-text">{error}</div>}

        <button
          className="btn-primary btn-large"
          type="submit"
          disabled={
            working ||
            !email ||
            !password ||
            (mode === "signup" && !displayName.trim())
          }
        >
          {working && <Loader2 className="spin" size={18} />}

          {working
            ? "Please wait..."
            : mode === "login"
            ? "Log in"
            : "Create account"}
        </button>

        <p className="auth-small">
          Don't want an account? You can still use the normal help
          request form on the homepage.
        </p>
      </form>
    </main>
  );
}

/* =========================================================
   NORMAL USER DASHBOARD
========================================================= */

function UserDashboard({ session, profile, onSignOut }) {
  const [screen, setScreen] = useState("dashboard");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setConversations(data || []);
    }

    setLoading(false);
  }, [session.user.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  function openConversation(conversation) {
    setSelectedConversation(conversation);
    setScreen("chat");
    setMenuOpen(false);
  }

  const active = conversations.filter(
    (conversation) => conversation.status !== "resolved"
  );

  const previous = conversations.filter(
    (conversation) => conversation.status === "resolved"
  );

  if (screen === "chat" && selectedConversation) {
    return (
      <UserChat
        session={session}
        conversation={selectedConversation}
        onBack={() => {
          setSelectedConversation(null);
          setScreen("dashboard");
          loadConversations();
        }}
      />
    );
  }

  if (screen === "new") {
    return (
      <NewConversation
        session={session}
        onCancel={() => setScreen("dashboard")}
        onCreated={(conversation) => {
          setSelectedConversation(conversation);
          setScreen("chat");
          loadConversations();
        }}
      />
    );
  }

  return (
    <div className="member-shell">
      <MemberSidebar
        profile={profile}
        screen={screen}
        setScreen={setScreen}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSignOut={onSignOut}
      />

      <main className="member-main">
        <div className="mobile-member-bar">
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <strong>Digital Hand</strong>
        </div>

        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">MY SUPPORT</span>

            <h1>
              Hi {profile.display_name?.split(" ")[0] || "there"} 👋
            </h1>

            <p>
              Your active support and previous conversations are
              all in one place.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => setScreen("new")}
          >
            <Plus size={18} />
            Start new chat
          </button>
        </div>

        <div className="dashboard-stats">
          <div>
            <MessagesSquare size={21} />
            <span>{active.length}</span>
            <small>Active chats</small>
          </div>

          <div>
            <CheckCircle2 size={21} />
            <span>{previous.length}</span>
            <small>Previous chats</small>
          </div>
        </div>

        {loading ? (
          <div className="center-loading">
            <Loader2 className="spin" size={28} />
          </div>
        ) : (
          <>
            <section className="dashboard-section">
              <div className="dashboard-section-title">
                <div>
                  <h2>Active support</h2>
                  <p>Conversations that are still being worked on.</p>
                </div>
              </div>

              {active.length === 0 ? (
                <div className="dashboard-empty">
                  <MessagesSquare size={34} />

                  <h3>No active conversations</h3>

                  <p>
                    Start a chat when you need help with technology.
                  </p>

                  <button
                    className="btn-primary"
                    onClick={() => setScreen("new")}
                  >
                    Start a chat
                  </button>
                </div>
              ) : (
                <div className="conversation-grid">
                  {active.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      onOpen={() => openConversation(conversation)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <div className="dashboard-section-title">
                <div>
                  <h2>Previous conversations</h2>

                  <p>
                    Revisit support you've received in the past.
                  </p>
                </div>
              </div>

              {previous.length === 0 ? (
                <p className="muted">
                  You don't have any previous conversations yet.
                </p>
              ) : (
                <div className="conversation-grid">
                  {previous.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      onOpen={() => openConversation(conversation)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MemberSidebar({
  profile,
  screen,
  setScreen,
  menuOpen,
  setMenuOpen,
  onSignOut,
}) {
  return (
    <>
      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`member-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <NodeMark />
            <strong>Digital Hand</strong>

            <button
              className="sidebar-close"
              onClick={() => setMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <button
              className={screen === "dashboard" ? "sidebar-active" : ""}
              onClick={() => {
                setScreen("dashboard");
                setMenuOpen(false);
              }}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              onClick={() => {
                setScreen("new");
                setMenuOpen(false);
              }}
            >
              <Plus size={18} />
              New support chat
            </button>
          </nav>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <CircleUserRound size={22} />
          </div>

          <div>
            <strong>{profile.display_name || "User"}</strong>
            <small>Digital Hand member</small>
          </div>

          <button
            className="sidebar-logout"
            title="Log out"
            onClick={onSignOut}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}

function ConversationCard({ conversation, onOpen }) {
  const status = STATUS[conversation.status] || STATUS.open;

  return (
    <button className="conversation-card" onClick={onOpen}>
      <div className="conversation-card-top">
        <span
          className="conversation-status-dot"
          style={{ background: status.color }}
        />

        <span className="conversation-status">{status.label}</span>

        <span className="conversation-date">
          {timeAgo(conversation.updated_at)}
        </span>
      </div>

      <h3>{conversation.title}</h3>

      <p>
        {conversation.helper_id
          ? "A Digital Hand helper is assisting you."
          : "Waiting for a helper to join."}
      </p>

      <span className="conversation-open">
        {conversation.status === "resolved"
          ? "View conversation"
          : "Continue chat"}

        <ArrowRight size={16} />
      </span>
    </button>
  );
}

/* =========================================================
   NEW CHAT
========================================================= */

function NewConversation({ session, onCancel, onCreated }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function createConversation(e) {
    e.preventDefault();

    if (!title.trim() || !message.trim()) return;

    setWorking(true);
    setError("");

    try {
      const { data: conversation, error: conversationError } =
        await supabase
          .from("conversations")
          .insert({
            user_id: session.user.id,
            title: title.trim(),
            status: "open",
          })
          .select()
          .single();

      if (conversationError) throw conversationError;

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: session.user.id,
          message: message.trim(),
        });

      if (messageError) throw messageError;

      onCreated(conversation);
    } catch (err) {
      console.error(err);
      setError(err.message || "Couldn't start the conversation.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="new-chat-page">
      <button className="policy-back" onClick={onCancel}>
        ← Back to my support
      </button>

      <div className="new-chat-layout">
        <div>
          <span className="eyebrow">NEW SUPPORT CHAT</span>

          <h1>What can we help with?</h1>

          <p>
            Tell us what's happening in your own words. You don't
            need to know the technical terms.
          </p>
        </div>

        <form className="card new-chat-form" onSubmit={createConversation}>
          <label className="field">
            <span>What is the problem about?</span>

            <span className="field-help">
              Keep this short — for example, "Printer won't connect".
            </span>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Printer won't connect"
              maxLength={100}
            />
          </label>

          <label className="field">
            <span>Tell us what's happening</span>

            <span className="field-help">
              Describe what you're seeing and what you've already
              tried, if anything.
            </span>

            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="My printer was working yesterday but today my computer says it is offline..."
            />
          </label>

          <div className="form-safety">
            <ShieldCheck size={22} />

            <div>
              <strong>Keep sensitive information private.</strong>

              <p>
                Don't send passwords, banking information, PINs or
                authentication codes.
              </p>
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}

          <button
            className="btn-primary btn-large"
            type="submit"
            disabled={working || !title.trim() || !message.trim()}
          >
            {working && <Loader2 className="spin" size={18} />}

            {working ? "Starting chat..." : "Start support chat"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* =========================================================
   USER CHAT
========================================================= */

function UserChat({ session, conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages(data || []);
    }

    setLoading(false);
  }, [conversation.id]);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((current) => {
            const exists = current.some(
              (message) => message.id === payload.new.id
            );

            return exists ? current : [...current, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();

    setNewMessage("");
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: session.user.id,
      message: content,
    });

    if (error) {
      console.error(error);
      setNewMessage(content);
    }

    setSending(false);
  }

  const resolved = conversation.status === "resolved";

  return (
    <main className="chat-page">
      <div className="chat-topbar">
        <button className="chat-back" onClick={onBack}>
          ← My support
        </button>

        <div>
          <h1>{conversation.title}</h1>

          <p>
            {resolved
              ? "Resolved conversation"
              : conversation.helper_id
              ? "A Digital Hand helper is assisting you"
              : "Waiting for a helper"}
          </p>
        </div>

        <span
          className={`chat-status ${
            resolved ? "chat-status-resolved" : ""
          }`}
        >
          {resolved ? (
            <>
              <Check size={15} />
              Resolved
            </>
          ) : (
            <>
              <span className="online-dot" />
              Support chat
            </>
          )}
        </span>
      </div>

      <div className="chat-window">
        <div className="chat-safety">
          <ShieldCheck size={18} />

          <span>
            Never send passwords, banking details, PINs or security
            codes.
          </span>
        </div>

        <div className="messages-area">
          {loading ? (
            <div className="center-loading">
              <Loader2 className="spin" size={26} />
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.sender_id === session.user.id;

              return (
                <div
                  key={message.id}
                  className={`message-row ${
                    mine ? "message-row-mine" : ""
                  }`}
                >
                  <div
                    className={`message-bubble ${
                      mine ? "message-mine" : "message-helper"
                    }`}
                  >
                    <span className="message-sender">
                      {mine ? "You" : "Digital Hand helper"}
                    </span>

                    <p>{message.message}</p>

                    <small>{formatDate(message.created_at)}</small>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {resolved ? (
          <div className="resolved-chat-notice">
            <CheckCircle2 size={22} />

            <div>
              <strong>This conversation has been resolved.</strong>

              <p>
                You can still read the full conversation. Start a new
                chat if you need help with another problem.
              </p>
            </div>
          </div>
        ) : (
          <form className="chat-composer" onSubmit={sendMessage}>
            <textarea
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />

            <button
              type="submit"
              className="chat-send"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <Loader2 className="spin" size={19} />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   HELPER CHAT DASHBOARD
========================================================= */

function HelperChatDashboard({
  session,
  profile,
  onSignOut,
}) {
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState("open");
  const [selectedConversation, setSelectedConversation] =
    useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setConversations(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (selectedConversation) {
    return (
      <HelperChat
        session={session}
        profile={profile}
        conversation={selectedConversation}
        onBack={() => {
          setSelectedConversation(null);
          load();
        }}
      />
    );
  }

  const filtered = conversations.filter((conversation) => {
    if (filter === "all") return true;

    if (filter === "mine") {
      return (
        conversation.helper_id === session.user.id &&
        conversation.status !== "resolved"
      );
    }

    return conversation.status === filter;
  });

  const openCount = conversations.filter(
    (conversation) => conversation.status === "open"
  ).length;

  const myCount = conversations.filter(
    (conversation) =>
      conversation.helper_id === session.user.id &&
      conversation.status !== "resolved"
  ).length;

  return (
    <main className="helper-dashboard">
      <div className="queue-head">
        <div>
          <span className="eyebrow">DIGITAL HAND HELPER</span>

          <h1>Support conversations</h1>

          <p className="muted">
            Signed in as{" "}
            <strong>{profile.display_name || "Helper"}</strong>
          </p>
        </div>

        <div className="helper-head-actions">
          <button className="btn-ghost" onClick={load}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="btn-ghost" onClick={onSignOut}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>

      <div className="helper-stats">
        <div>
          <strong>{openCount}</strong>
          <span>Waiting for help</span>
        </div>

        <div>
          <strong>{myCount}</strong>
          <span>Assigned to me</span>
        </div>
      </div>

      <div className="filter-row">
        <button
          className={`chip ${filter === "open" ? "chip-active" : ""}`}
          onClick={() => setFilter("open")}
        >
          Waiting ({openCount})
        </button>

        <button
          className={`chip ${filter === "mine" ? "chip-active" : ""}`}
          onClick={() => setFilter("mine")}
        >
          My chats ({myCount})
        </button>

        <button
          className={`chip ${
            filter === "resolved" ? "chip-active" : ""
          }`}
          onClick={() => setFilter("resolved")}
        >
          Resolved
        </button>

        <button
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="center-loading">
          <Loader2 className="spin" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="dashboard-empty">
          <CheckCircle2 size={35} />
          <h3>Nothing here right now</h3>
        </div>
      ) : (
        <div className="helper-conversation-list">
          {filtered.map((conversation) => (
            <button
              key={conversation.id}
              className="helper-conversation-card"
              onClick={() => setSelectedConversation(conversation)}
            >
              <div>
                <span className="helper-conversation-status">
                  {STATUS[conversation.status]?.label || "Open"}
                </span>

                <h3>{conversation.title}</h3>

                <p>
                  {conversation.helper_id === session.user.id
                    ? "Assigned to you"
                    : conversation.helper_id
                    ? "Assigned to another helper"
                    : "Waiting for a helper"}
                </p>
              </div>

              <div className="helper-conversation-meta">
                <span>{timeAgo(conversation.updated_at)}</span>
                <ArrowRight size={17} />
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   HELPER CHAT
========================================================= */

function HelperChat({
  session,
  profile,
  conversation,
  onBack,
}) {
  const [currentConversation, setCurrentConversation] =
    useState(conversation);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages(data || []);
    }

    setLoading(false);
  }, [conversation.id]);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`helper-conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((current) => {
            const exists = current.some(
              (message) => message.id === payload.new.id
            );

            return exists ? current : [...current, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function claimConversation() {
    setWorking(true);

    const { data, error } = await supabase
      .from("conversations")
      .update({
        helper_id: session.user.id,
        status: "in_progress",
      })
      .eq("id", conversation.id)
      .select()
      .single();

    if (!error) {
      setCurrentConversation(data);
    } else {
      console.error(error);
    }

    setWorking(false);
  }

  async function resolveConversation() {
    setWorking(true);

    const { data, error } = await supabase
      .from("conversations")
      .update({
        status: "resolved",
      })
      .eq("id", conversation.id)
      .select()
      .single();

    if (!error) {
      setCurrentConversation(data);
    } else {
      console.error(error);
    }

    setWorking(false);
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!newMessage.trim() || working) return;

    const content = newMessage.trim();

    setNewMessage("");
    setWorking(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: session.user.id,
      message: content,
    });

    if (error) {
      console.error(error);
      setNewMessage(content);
    }

    setWorking(false);
  }

  const isMine = currentConversation.helper_id === session.user.id;
  const isUnclaimed = !currentConversation.helper_id;
  const resolved = currentConversation.status === "resolved";

  return (
    <main className="chat-page helper-chat-page">
      <div className="chat-topbar">
        <button className="chat-back" onClick={onBack}>
          ← Support queue
        </button>

        <div>
          <span className="eyebrow">HELPER CHAT</span>

          <h1>{currentConversation.title}</h1>

          <p>
            {isUnclaimed
              ? "This conversation is waiting for a helper."
              : isMine
              ? `Assigned to ${profile.display_name}`
              : "Assigned to another helper."}
          </p>
        </div>

        <div className="helper-chat-actions">
          {isUnclaimed && !resolved && (
            <button
              className="btn-primary"
              onClick={claimConversation}
              disabled={working}
            >
              Claim conversation
            </button>
          )}

          {isMine && !resolved && (
            <button
              className="btn-ghost"
              onClick={resolveConversation}
              disabled={working}
            >
              <CheckCircle2 size={17} />
              Mark resolved
            </button>
          )}
        </div>
      </div>

      <div className="chat-window">
        <div className="chat-safety">
          <ShieldCheck size={18} />

          <span>
            Never ask users to send passwords, banking details,
            PINs or security codes.
          </span>
        </div>

        <div className="messages-area">
          {loading ? (
            <div className="center-loading">
              <Loader2 className="spin" size={26} />
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.sender_id === session.user.id;

              return (
                <div
                  key={message.id}
                  className={`message-row ${
                    mine ? "message-row-mine" : ""
                  }`}
                >
                  <div
                    className={`message-bubble ${
                      mine ? "message-mine" : "message-user"
                    }`}
                  >
                    <span className="message-sender">
                      {mine ? "You" : "User"}
                    </span>

                    <p>{message.message}</p>

                    <small>{formatDate(message.created_at)}</small>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {resolved ? (
          <div className="resolved-chat-notice">
            <CheckCircle2 size={22} />

            <div>
              <strong>Conversation resolved.</strong>

              <p>This chat is now part of the user's support history.</p>
            </div>
          </div>
        ) : isMine ? (
          <form className="chat-composer" onSubmit={sendMessage}>
            <textarea
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Reply to the user..."
            />

            <button
              type="submit"
              className="chat-send"
              disabled={!newMessage.trim() || working}
            >
              {working ? (
                <Loader2 className="spin" size={19} />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>
        ) : (
          <div className="claim-before-reply">
            {isUnclaimed
              ? "Claim this conversation before replying."
              : "This conversation is assigned to another helper."}
          </div>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   EXISTING NO-ACCOUNT VOLUNTEER TICKET PORTAL
========================================================= */

function VolunteerArea({
  session,
  profile,
  checkingSession,
  reloadProfile,
  onSignOut,
}) {
  if (checkingSession) return <LoadingPage />;

  if (!session) {
    return <VolunteerLogin />;
  }

  if (!profile) {
    return (
      <main className="portal-page">
        <div className="card gate">
          <p>Couldn't load your profile.</p>

          <button className="btn-ghost" onClick={reloadProfile}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!["helper", "admin"].includes(profile.role)) {
    return (
      <main className="portal-page">
        <div className="card gate">
          <Lock size={30} />

          <h2>Helper access required</h2>

          <p className="muted">
            This area is only available to authorised Digital Hand
            helpers.
          </p>

          <button className="btn-ghost" onClick={onSignOut}>
            Log out
          </button>
        </div>
      </main>
    );
  }

  return (
    <Queue
      volunteerName={profile.display_name || "Helper"}
      onSwitchUser={onSignOut}
    />
  );
}

function VolunteerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();

    setSigningIn(true);
    setError("");

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setError("That email or password didn't work.");
    }

    setSigningIn(false);
  }

  return (
    <main className="portal-page">
      <form className="card gate" onSubmit={login}>
        <div className="gate-icon">
          <Lock size={28} />
        </div>

        <span className="eyebrow">DIGITAL HAND HELPERS</span>

        <h2>Volunteer sign-in</h2>

        <p className="muted">
          Only authorised helpers can access support requests.
        </p>

        <label className="field">
          <span>Email</span>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="error-text">{error}</div>}

        <button
          className="btn-primary"
          type="submit"
          disabled={!email || !password || signingIn}
        >
          {signingIn && <Loader2 className="spin" size={17} />}

          {signingIn ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
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
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTickets(data || []);
    } catch {
      setError("Couldn't load the request queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateTicket(id, patch) {
    const { error: updateError } = await supabase
      .from("tickets")
      .update(patch)
      .eq("id", id);

    if (updateError) {
      setError("Couldn't save that change.");
      return;
    }

    await load();
  }

  const filtered = tickets.filter(
    (ticket) => filter === "all" || ticket.status === filter
  );

  return (
    <main className="portal-page">
      <div className="queue-head">
        <div>
          <span className="eyebrow">NO-ACCOUNT REQUESTS</span>

          <h2 className="queue-title">Help requests</h2>

          <p className="muted">
            Signed in as <strong>{volunteerName}</strong>
          </p>
        </div>

        <div className="helper-head-actions">
          <button className="btn-ghost" onClick={load}>
            <RefreshCw size={15} />
            Refresh
          </button>

          <button className="btn-ghost" onClick={onSwitchUser}>
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </div>

      <div className="filter-row">
        {["open", "in_progress", "resolved", "all"].map((item) => (
          <button
            key={item}
            className={`chip ${
              filter === item ? "chip-active" : ""
            }`}
            onClick={() => setFilter(item)}
          >
            {item === "open"
              ? "New"
              : item === "in_progress"
              ? "In progress"
              : item === "resolved"
              ? "Resolved"
              : "All"}
          </button>
        ))}
      </div>

      {error && <div className="error-text">{error}</div>}

      {loading ? (
        <LoadingPage />
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

  const Icon = methodInfo?.icon || Phone;

  return (
    <li className="ticket-card">
      <button className="ticket-summary" onClick={onToggle}>
        <span className="ticket-name">{ticket.name}</span>
        <span className="ticket-desc">{ticket.description}</span>
        <span className="ticket-time">{timeAgo(ticket.created_at)}</span>

        {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>

      {expanded && (
        <div className="ticket-body">
          <div className="detail-grid">
            <div>
              <span className="detail-label">Contact</span>
              <span>{ticket.contact}</span>
            </div>

            <div>
              <span className="detail-label">Preferred method</span>

              <span className="inline-icon">
                <Icon size={14} />
                {methodInfo?.label}
              </span>
            </div>
          </div>

          <p className="full-desc">{ticket.description}</p>

          <div className="action-row">
            {!ticket.claimed_by && (
              <button
                className="btn-primary small"
                onClick={() =>
                  onUpdate({
                    claimed_by: volunteerName,
                    status: "in_progress",
                  })
                }
              >
                Claim request
              </button>
            )}

            <select
              value={ticket.status}
              onChange={(e) =>
                onUpdate({ status: e.target.value })
              }
              className="status-select"
            >
              <option value="open">New</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <label className="field">
            <span>Notes</span>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdate({ notes })}
            />
          </label>
        </div>
      )}
    </li>
  );
}

/* =========================================================
   POLICIES
========================================================= */

function PrivacyView({ onBack }) {
  return (
    <main className="policy-page">
      <button className="policy-back" onClick={onBack}>
        ← Back to Digital Hand
      </button>

      <div className="policy-card">
        <span className="eyebrow">DIGITAL HAND</span>

        <h1>Privacy Policy</h1>

        <p className="policy-updated">
          Last updated: August 2026
        </p>

        <section>
          <h2>Information we collect</h2>

          <p>
            Digital Hand may collect your name, contact details,
            support requests, account information and messages you
            send through the support platform.
          </p>
        </section>

        <section>
          <h2>Why we collect it</h2>

          <p>
            We use this information to provide technology support,
            maintain your support history and allow you to return to
            conversations.
          </p>
        </section>

        <section>
          <h2>Support conversations</h2>

          <p>
            If you create an account, your Digital Hand
            conversations may remain associated with your account so
            you can revisit them later.
          </p>
        </section>

        <section>
          <h2>Sensitive information</h2>

          <div className="policy-warning">
            <ShieldCheck size={22} />

            <div>
              <strong>Never send passwords or financial details.</strong>

              <p>
                Do not send passwords, PINs, banking details, card
                information or authentication codes through Digital
                Hand.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>Who can access your information</h2>

          <p>
            Support information is intended to be accessible only to
            authorised Digital Hand helpers and the user associated
            with the support request.
          </p>
        </section>

        <section>
          <h2>Contact</h2>

          <p>
            You can contact Digital Hand if you have questions about
            your information or would like to request correction or
            deletion where appropriate.
          </p>
        </section>
      </div>
    </main>
  );
}

function SafetyView({ onBack }) {
  return (
    <main className="policy-page">
      <button className="policy-back" onClick={onBack}>
        ← Back to Digital Hand
      </button>

      <div className="policy-card">
        <span className="eyebrow">DIGITAL HAND</span>

        <h1>Staying Safe</h1>

        <div className="safety-rule-grid">
          <SafetyRule
            icon={Lock}
            title="Keep passwords private"
            text="Digital Hand helpers should never ask you to send your password."
          />

          <SafetyRule
            icon={ShieldCheck}
            title="Never share security codes"
            text="Do not share PINs, verification codes or account recovery codes."
          />

          <SafetyRule
            icon={HeartHandshake}
            title="Our help is free"
            text="You should not be asked to pay for Digital Hand assistance."
          />

          <SafetyRule
            icon={Laptop}
            title="You stay in control"
            text="You can stop receiving help whenever you want."
          />
        </div>
      </div>
    </main>
  );
}

function SafetyRule({ icon: Icon, title, text }) {
  return (
    <div className="safety-rule">
      <Icon size={25} />

      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="center-loading">
      <Loader2 className="spin" size={28} />
    </div>
  );
}
