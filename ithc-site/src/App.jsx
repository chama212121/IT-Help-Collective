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
  Radio,
} from "lucide-react";
import { supabase } from "./supabaseClient";

// ---------------------------------------------------------------------------
// IT Help Collective — ticket intake + volunteer queue
//
// Tickets are stored in a real Supabase (Postgres) table called "tickets".
// See README.md for the SQL to create it. The "volunteer sign-in" is a
// display name only, stored in the browser's localStorage — it is NOT a
// real login. Anyone with the /volunteer view can see and edit the queue.
// That's fine for a small trusted team; add Supabase Auth before this ever
// handles anything sensitive.
// ---------------------------------------------------------------------------

const VOLUNTEER_KEY = "ithc_volunteer_name";

const CONTACT_METHODS = [
  { id: "phone", label: "Phone call", icon: Phone },
  { id: "video", label: "Video call", icon: Video },
  { id: "email", label: "Email", icon: Mail },
  { id: "in_person", label: "In person", icon: Home },
];

const URGENCY_LEVELS = [
  { id: "low", label: "Not urgent" },
  { id: "medium", label: "Somewhat urgent" },
  { id: "high", label: "Urgent" },
];

const STATUS = {
  open: { label: "New", color: "var(--amber)" },
  in_progress: { label: "In progress", color: "var(--teal)" },
  resolved: { label: "Resolved", color: "var(--slate)" },
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
      <line x1="10" y1="30" x2="20" y2="10" stroke="var(--teal)" strokeWidth="2" />
      <line x1="20" y1="10" x2="30" y2="30" stroke="var(--teal)" strokeWidth="2" />
      <line x1="10" y1="30" x2="30" y2="30" stroke="var(--teal)" strokeWidth="2" opacity="0.5" />
      <circle cx="10" cy="30" r="4" fill="var(--ink)" />
      <circle cx="30" cy="30" r="4" fill="var(--ink)" />
      <circle cx="20" cy="10" r="4.5" fill="var(--teal)" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState("public");

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <NodeMark />
          <span className="brand-name">IT Help Collective</span>
        </div>
        <nav className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={view === "public"}
            className={`tab ${view === "public" ? "tab-active" : ""}`}
            onClick={() => setView("public")}
          >
            Get help
          </button>
          <button
            role="tab"
            aria-selected={view === "volunteer"}
            className={`tab ${view === "volunteer" ? "tab-active" : ""}`}
            onClick={() => setView("volunteer")}
          >
            Volunteer portal
          </button>
        </nav>
      </header>

      {view === "public" ? <PublicView /> : <VolunteerView />}

      <footer className="foot">Free, volunteer-run tech support. No cost, ever.</footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public: submit a ticket
// ---------------------------------------------------------------------------

function PublicView() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod] = useState("phone");
  const [urgency, setUrgency] = useState("low");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const valid = name.trim() && contact.trim() && description.trim().length > 4;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const { error: insertError } = await supabase.from("tickets").insert([
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
      setError("Something went wrong sending your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="wrap">
        <div className="card confirm">
          <CheckCircle2 size={40} color="var(--teal)" />
          <h2>Request received</h2>
          <p>
            Thanks, {name.split(" ")[0]}. A volunteer will reach out via your preferred
            method within one business day. There's nothing else you need to do.
          </p>
          <button className="btn-ghost" onClick={() => setSubmitted(false)}>
            Submit another request
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap">
      <section className="hero">
        <h1>Free tech help, from real people.</h1>
        <p>
          Stuck with a computer, phone, or the internet? Tell us what's going on
          and a volunteer will help — by phone, video, email, or in person.
          No cost, no jargon, no catch.
        </p>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
        </label>

        <label className="field">
          <span>Phone number or email</span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="So a volunteer can reach you"
          />
        </label>

        <div className="field">
          <span>How would you like to be helped?</span>
          <div className="chip-row">
            {CONTACT_METHODS.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                className={`chip ${method === id ? "chip-active" : ""}`}
                onClick={() => setMethod(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>How urgent is this?</span>
          <div className="chip-row">
            {URGENCY_LEVELS.map(({ id, label }) => (
              <button
                type="button"
                key={id}
                className={`chip ${urgency === id ? "chip-active" : ""}`}
                onClick={() => setUrgency(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>What's going on?</span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem in your own words — as much or as little detail as you like."
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="btn-primary" type="submit" disabled={!valid || submitting}>
          {submitting ? <Loader2 className="spin" size={16} /> : null}
          {submitting ? "Sending…" : "Submit request"}
        </button>
      </form>

      <section className="steps">
        <Step n="1" label="Submitted" text="Your request lands in our queue right away." />
        <div className="step-line" />
        <Step n="2" label="Claimed" text="A volunteer picks it up and reaches out to you." />
        <div className="step-line" />
        <Step n="3" label="Resolved" text="We help you sort it, free of charge." />
      </section>
    </main>
  );
}

function Step({ n, label, text }) {
  return (
    <div className="step">
      <div className="step-dot">{n}</div>
      <div className="step-label">{label}</div>
      <div className="step-text">{text}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Volunteer: queue + ticket management
// ---------------------------------------------------------------------------

function VolunteerView() {
  const [volunteerName, setVolunteerName] = useState(
    () => localStorage.getItem(VOLUNTEER_KEY) || null
  );
  const [nameInput, setNameInput] = useState("");

  function saveName(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem(VOLUNTEER_KEY, trimmed);
    setVolunteerName(trimmed);
  }

  if (!volunteerName) {
    return (
      <main className="wrap">
        <form className="card gate" onSubmit={saveName}>
          <Radio size={28} color="var(--teal)" />
          <h2>Volunteer sign-in</h2>
          <p className="muted">
            Enter your name so tickets you claim show who's helping. This is
            just a label, not a password — anyone with this page can view the
            queue. Add real login (Supabase Auth) before opening this to
            outside volunteers.
          </p>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            autoFocus
          />
          <button className="btn-primary" type="submit" disabled={!nameInput.trim()}>
            Continue
          </button>
        </form>
      </main>
    );
  }

  return (
    <Queue
      volunteerName={volunteerName}
      onSwitchUser={() => {
        localStorage.removeItem(VOLUNTEER_KEY);
        setVolunteerName(null);
      }}
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
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setTickets(data || []);
    } catch {
      setError("Couldn't load the queue. Check your connection and try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateTicket(id, patch) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const { error: updateError } = await supabase.from("tickets").update(patch).eq("id", id);
      if (updateError) throw updateError;
    } catch {
      setError("Couldn't save that change — check your connection and try again.");
    }
  }

  const filtered = tickets.filter((t) => (filter === "all" ? true : t.status === filter));
  const counts = tickets.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }), {});

  return (
    <main className="wrap">
      <div className="queue-head">
        <div>
          <h2 className="queue-title">Ticket queue</h2>
          <p className="muted">
            Signed in as {volunteerName} · <button className="link-btn" onClick={onSwitchUser}>switch</button>
          </p>
        </div>
        <button className="btn-ghost" onClick={load}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="filter-row">
        {[
          { id: "open", label: `New (${counts.open || 0})` },
          { id: "in_progress", label: `In progress (${counts.in_progress || 0})` },
          { id: "resolved", label: `Resolved (${counts.resolved || 0})` },
          { id: "all", label: "All" },
        ].map((f) => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? "chip-active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="center-loading">
          <Loader2 className="spin" size={20} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">Nothing here. New requests will show up automatically.</div>
      ) : (
        <ul className="ticket-list">
          {filtered.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              expanded={expandedId === t.id}
              onToggle={() => setExpandedId(expandedId === t.id ? null : t.id)}
              onUpdate={(patch) => updateTicket(t.id, patch)}
              volunteerName={volunteerName}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

function TicketCard({ ticket, expanded, onToggle, onUpdate, volunteerName }) {
  const [notes, setNotes] = useState(ticket.notes || "");
  const methodInfo = CONTACT_METHODS.find((m) => m.id === ticket.method);
  const Icon = methodInfo ? methodInfo.icon : Phone;
  const urgencyInfo = URGENCY_LEVELS.find((u) => u.id === ticket.urgency);
  const statusInfo = STATUS[ticket.status];

  return (
    <li className="ticket-card">
      <button className="ticket-summary" onClick={onToggle}>
        <span className="status-dot" style={{ background: statusInfo.color }} />
        <span className="ticket-name">{ticket.name}</span>
        <span className="ticket-desc">{ticket.description}</span>
        {ticket.urgency === "high" && <span className="badge-urgent">Urgent</span>}
        <span className="ticket-time">{timeAgo(ticket.created_at)}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                <Icon size={14} /> {methodInfo?.label}
              </span>
            </div>
            <div>
              <span className="detail-label">Urgency</span>
              <span>{urgencyInfo?.label}</span>
            </div>
            <div>
              <span className="detail-label">Submitted</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>

          <p className="full-desc">{ticket.description}</p>

          <div className="action-row">
            {!ticket.claimed_by ? (
              <button
                className="btn-primary small"
                onClick={() => onUpdate({ claimed_by: volunteerName, status: "in_progress" })}
              >
                Claim this ticket
              </button>
            ) : (
              <span className="claimed-by">Claimed by {ticket.claimed_by}</span>
            )}

            <select
              value={ticket.status}
              onChange={(e) => onUpdate({ status: e.target.value })}
              className="status-select"
            >
              {Object.entries(STATUS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          <label className="field">
            <span>Notes for other volunteers</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdate({ notes })}
              placeholder="What's been tried, what's next…"
            />
          </label>
        </div>
      )}
    </li>
  );
}
