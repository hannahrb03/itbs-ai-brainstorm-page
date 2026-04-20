  import React, { useEffect, useMemo, useState } from "react";
  import { motion } from "framer-motion";
  import {
    Sparkles,
    Trophy,
    Lightbulb,
    Send,
    BarChart3,
    Clock3,
    Wrench,
    BadgeCheck,
    RotateCcw,
    type LucideIcon,
  } from "lucide-react";
  import { createClient, type SupabaseClient } from
  "@supabase/supabase-js";

  type PainPoint = {
    id: string;
    label: string;
    summary: string;
  };

  type ScoreResult = {
    isIncomplete?: boolean;
    impact: number;
    feasibility: number;
    timeToValue: number;
    effort: number;
    total: number;
    overallLabel: string;
    explanations: {
      impact: string;
      feasibility: string;
      timeToValue: string;
      effort: string;
    };
  };

  type Submission = {
    id: string;
    teamName: string;
    idea: string;
    category: string;
    categoryLabel: string;
    painPointSummary: string;
    score: ScoreResult;
    createdAt?: string;
  };

  type SubmissionRow = {
    id: string;
    team_name: string;
    idea: string;
    category: string;
    category_label: string;
    pain_point_summary: string;
    impact: number;
    feasibility: number;
    time_to_value: number;
    effort: number;
    total: number;
    overall_label: string;
    explanation_impact: string;
    explanation_feasibility: string;
    explanation_time_to_value: string;
    explanation_effort: string;
    created_at: string;
  };

  const painPoints: PainPoint[] = [
    {
      id: "manual-processes",
      label: "Manual Processes",
      summary: "Work is too manual, repetitive, and dependent on
   individual effort instead of streamlined workflows.",
    },
    {
      id: "integration-disconnected-systems",
      label: "Integration & Disconnected Systems",
      summary: "Teams work across disconnected tools and
  systems, creating friction, duplicate effort, and handoff
  issues.",
    },
    {
      id: "inconsistency-standardization",
      label: "Inconsistency & Standardization",
      summary: "Processes, documentation, and execution vary too
   much across teams, reducing quality and predictability.",
    },
    {
      id: "communication-transparency",
      label: "Communication & Transparency",
      summary: "People do not always have clear visibility into
  status, ownership, decisions, or expectations.",
    },
    {
      id: "training-onboarding-knowledge",
      label: "Training, Onboarding & Knowledge Access",
      summary: "It is difficult to learn processes, find the
  right information, and ramp up quickly in a complex
  organization.",
    },
    {
      id: "complexity-structure",
      label: "Complexity & Organizational Structure",
      summary: "The organization feels complex, layered, or hard
   to navigate, which slows execution and decision-making.",
    },
    {
      id: "duplication-workarounds",
      label: "Duplication & Workarounds",
      summary: "People create duplicate work, side processes, or
   manual workarounds because the core process is not working
  cleanly.",
    },
    {
      id: "frustration-engagement",
      label: "Frustration & Engagement",
      summary: "Pain points create frustration, reduce
  engagement, and make it harder for teams to do their best
  work.",
    },
  ];

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as
  string | undefined;
  const supabaseKey =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string |
  undefined) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string |
  undefined);

  const supabaseEnabled = Boolean(supabaseUrl && supabaseKey);

  let supabase: SupabaseClient | null = null;
  if (supabaseEnabled) {
    supabase = createClient(supabaseUrl!, supabaseKey!);
  }

  function clamp(num: number, min: number, max: number) {
    return Math.max(min, Math.min(max, num));
  }

  function scoreIdea(text: string, category: string):
  ScoreResult {
    const t = text.toLowerCase().trim();
    const words = t.split(/\s+/).filter(Boolean);

    if (words.length < 4) {
      return {
        impact: 1,
        feasibility: 1,
        timeToValue: 1,
        effort: 1,
        total: 4,
        overallLabel: "Needs detail",
        isIncomplete: true,
        explanations: {
          impact: "Not enough detail to determine value.",
          feasibility: "Not enough detail to determine
  feasibility.",
          timeToValue: "Not enough detail to estimate
  timeline.",
          effort: "Not enough detail to assess effort.",
        },
      };
    }

    const hasSpecificAction =
  /(build|create|automate|summarize|draft|analyze|classify|route
  |predict|surface|recommend|generate)/.test(t);
    const hasAudience = /(employee|user|leader|manager|team|cust
  omer|analyst|engineer|service desk|stakeholder)/.test(t);
    const hasAiUseCase = /(ai|assistant|copilot|chatbot|search|s
  ummary|knowledge|workflow|agent)/.test(t);
    const hasIntegrationCue = /(teams|sharepoint|servicenow|emai
  l|slack|jira|sap|dashboard|excel)/.test(t);
    const hasSpeedCue =
  /(quick|fast|real-time|instantly|minutes)/.test(t);
    const hardCue = /(enterprise-wide|full rebuild|custom
  model)/.test(t);
    const easyCue = /(pilot|prototype|mvp|dashboard|summary|sear
  ch|faq|copilot|triage)/.test(t);

    let impact = 2;
    impact += hasAudience ? 1 : 0;
    impact += hasAiUseCase ? 1 : 0;
    impact +=
  /(reduce|save|improve|increase|faster|better)/.test(t) ? 1 :
  0;
    impact += /(hours|manual|rework|bottleneck|delay)/.test(t) ?
   1 : 0;
    if (category === "manual-processes" || category ===
  "training-onboarding-knowledge") {
      impact += 0.5;
    }

    let feasibility = 2;
    feasibility += hasSpecificAction ? 1 : 0;
    feasibility += hasIntegrationCue ? 1 : 0;
    feasibility += easyCue ? 1 : 0;
    feasibility -= hardCue ? 2 : 0;

    let timeToValue = 2;
    timeToValue += easyCue ? 1 : 0;
    timeToValue += hasSpeedCue ? 1 : 0;
    timeToValue -= hardCue ? 2 : 0;

    let effort = 2;
    effort += easyCue ? 1 : 0;
    effort += hasIntegrationCue ? 1 : 0;
    effort -= hardCue ? 2 : 0;

    impact = clamp(Math.round(impact), 1, 5);
    feasibility = clamp(Math.round(feasibility), 1, 5);
    timeToValue = clamp(Math.round(timeToValue), 1, 5);
    effort = clamp(Math.round(effort), 1, 5);

    const total = impact + feasibility + timeToValue + effort;

    const explanations = {
      impact:
        impact >= 4
          ? "High likely value with meaningful operational
  benefit."
          : impact === 3
            ? "Moderate value; could be more specific."
            : "Needs clearer business value.",
      feasibility:
        feasibility >= 4
          ? "Looks realistic with current tools and scope."
          : feasibility === 3
            ? "Possible, but likely needs tighter scoping."
            : "Hard to execute as written.",
      timeToValue:
        timeToValue >= 4
          ? "Benefits could likely show up quickly."
          : timeToValue === 3
            ? "Moderate timeline to see value."
            : "Likely a longer-term effort.",
      effort:
        effort >= 4
          ? "Relatively light lift for a first version."
          : effort === 3
            ? "Moderate implementation effort."
            : "Heavy lift for an initial release.",
    };

    let overallLabel = "Explore";
    if (total >= 17) overallLabel = "Top candidate";
    else if (total >= 14) overallLabel = "Strong";
    else if (total >= 11) overallLabel = "Refine";

    return { impact, feasibility, timeToValue, effort, total,
  overallLabel, explanations };
  }

  function rowToSubmission(row: SubmissionRow): Submission {
    return {
      id: row.id,
      teamName: row.team_name,
      idea: row.idea,
      category: row.category,
      categoryLabel: row.category_label,
      painPointSummary: row.pain_point_summary,
      createdAt: row.created_at,
      score: {
        impact: row.impact,
        feasibility: row.feasibility,
        timeToValue: row.time_to_value,
        effort: row.effort,
        total: row.total,
        overallLabel: row.overall_label,
        explanations: {
          impact: row.explanation_impact,
          feasibility: row.explanation_feasibility,
          timeToValue: row.explanation_time_to_value,
          effort: row.explanation_effort,
        },
      },
    };
  }

  function submissionToInsert(submission: Submission) {
    return {
      team_name: submission.teamName,
      idea: submission.idea,
      category: submission.category,
      category_label: submission.categoryLabel,
      pain_point_summary: submission.painPointSummary,
      impact: submission.score.impact,
      feasibility: submission.score.feasibility,
      time_to_value: submission.score.timeToValue,
      effort: submission.score.effort,
      total: submission.score.total,
      overall_label: submission.score.overallLabel,
      explanation_impact: submission.score.explanations.impact,
      explanation_feasibility:
  submission.score.explanations.feasibility,
      explanation_time_to_value:
  submission.score.explanations.timeToValue,
      explanation_effort: submission.score.explanations.effort,
    };
  }

  export default function App() {
    const [teamName, setTeamName] = useState("");
    const [category, setCategory] =
  useState("manual-processes");
    const [idea, setIdea] = useState("");
    const [ideas, setIdeas] = useState<Submission[]>([]);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] =
  useState(supabaseEnabled ? "Connected to live session." :
  "Supabase not configured yet.");

    const selectedPainPoint = painPoints.find((p) => p.id ===
  category) ?? painPoints[0];

    useEffect(() => {
      if (!supabase) return;

      const sb = supabase;
      let active = true;

      async function loadIdeas() {
        const { data, error } = await sb
          .from("brainstorm_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!active) return;

        if (error) {
          setStatusMessage(`Could not load submissions:
  ${error.message}`);
          return;
        }

        setIdeas(((data ?? []) as SubmissionRow[]).map((row:
  SubmissionRow) => rowToSubmission(row)));
        setStatusMessage("Connected to live session.");
      }

      loadIdeas();

      const channel = sb
        .channel("brainstorm-submissions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table:
  "brainstorm_submissions" },
          () => {
            loadIdeas();
          },
        )
        .subscribe();

      return () => {
        active = false;
        void sb.removeChannel(channel);
      };
    }, []);

    const rankedIdeas = useMemo(() => {
      return [...ideas]
        .sort((a, b) => {
          if (b.score.total !== a.score.total) return
  b.score.total - a.score.total;
          return (b.createdAt ?? "").localeCompare(a.createdAt
  ?? "");
        })
        .map((item, index) => ({ ...item, rank: index + 1 }));
    }, [ideas]);

    const top3 = rankedIdeas.slice(0, 3);

    const currentPreview = useMemo(() => {
      if (!idea.trim()) return null;
      return scoreIdea(idea, category);
    }, [idea, category]);

    async function submitIdea() {
      if (!idea.trim()) return;

      const score = scoreIdea(idea, category);

      if (score.isIncomplete) {
        setSubmitError("Please enter a fuller idea before
  submitting.");
        return;
      }

      const categoryMeta = painPoints.find((p) => p.id ===
  category) ?? painPoints[0];
      const submission: Submission = {
        id: crypto.randomUUID(),
        teamName: teamName.trim() || `Table ${ideas.length +
  1}`,
        idea: idea.trim(),
        category,
        categoryLabel: categoryMeta.label,
        painPointSummary: categoryMeta.summary,
        score,
      };

      if (!supabase) {
        setSubmitError("Supabase is not configured yet. Add
  VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        return;
      }

      const sb = supabase;
      setIsSubmitting(true);
      setSubmitError("");

      const { error } = await sb.from("brainstorm_submissions").insert(submissionToInsert(submission));

      setIsSubmitting(false);

      if (error) {
        setSubmitError(`Could not submit idea:
  ${error.message}`);
        return;
      }

      setIdea("");
      setStatusMessage("Idea submitted to live session.");
    }

    async function clearAllIdeas() {
      if (!supabase) {
        setSubmitError("Supabase is not configured yet.");
        return;
      }

      const sb = supabase;
      const confirmed = window.confirm("Clear all submissions
  for this session?");
      if (!confirmed) return;

      const { error } = await sb.from("brainstorm_submissions").delete().neq("id", "");
      if (error) {
        setSubmitError(`Could not clear submissions:
  ${error.message}`);
        return;
      }

      setStatusMessage("All submissions cleared.");
    }

    function handleKeyDown(e:
  React.KeyboardEvent<HTMLTextAreaElement>) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        void submitIdea();
      }
    }

    return (
      <div style={styles.page}>
        <style>{globalCss}</style>

        <div style={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="hero-grid"
            style={styles.heroGrid}
          >
            <section style={{ ...styles.card, ...styles.heroCard
   }}>
              <div style={styles.cardHeader}>
                <div style={styles.headerRow}>
                  <div style={styles.headerIconWrap}>
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h1 style={styles.title}>ITBS AI Brainstorm
  Page</h1>
                    <p style={styles.subtitle}>
                      Enter an AI idea, map it to a pain point,
  and get an instant score with clear rationale.
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div
  style={styles.statusBar}>{statusMessage}</div>

                <div className="form-grid"
  style={styles.formGrid}>
                  <Field label="Table / Team Name">
                    <input
                      value={teamName}
                      onChange={(e) =>
  setTeamName(e.target.value)}
                      placeholder="Example: Table 4"
                      style={styles.input}
                    />
                  </Field>

                  <Field label="Pain Point Category">
                    <select value={category} onChange={(e) =>
  setCategory(e.target.value)} style={styles.input}>
                      {painPoints.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <section style={styles.painPointCard}>
                  <div style={styles.selectedRow}>
                    <div style={styles.iconTile}>
                      <Lightbulb size={18} />
                    </div>
                    <div>
                      <div style={styles.eyebrow}>Selected pain
  point</div>
                      <div
  style={styles.sectionHeading}>{selectedPainPoint.label}</div>
                      <div
  style={styles.bodyText}>{selectedPainPoint.summary}</div>
                    </div>
                  </div>
                </section>

                <Field label="AI Brainstorm Idea">
                  <textarea
                    value={idea}
                    onChange={(e) => {
                      setIdea(e.target.value);
                      if (submitError) setSubmitError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Example: Build an AI assistant
  that summarizes incoming requests, suggests the right owner,
  and drafts the first response so teams spend less time
  triaging emails."
                    style={styles.textarea}
                  />
                  <div style={styles.helperText}>Tip: press
  Ctrl/Cmd + Enter to submit.</div>
                </Field>

                {submitError ? <div
  style={styles.submitError}>{submitError}</div> : null}

                <div style={styles.actionRow}>
                  <button type="button" onClick={() => void
  submitIdea()} style={styles.button} disabled={isSubmitting}>
                    <Send size={16} />
                    <span>{isSubmitting ? "Submitting..." :
  "Submit idea"}</span>
                  </button>
                  <button type="button" onClick={() => void
  clearAllIdeas()} style={styles.secondaryButton}>
                    <RotateCcw size={16} />
                    <span>Reset session</span>
                  </button>
                  <span style={styles.pill}>Shared live board
  across devices</span>
                </div>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Live scoring
  preview</h2>
                <p style={styles.subtitle}>As participants type,
   the grader explains how the idea is being evaluated.</p>
              </div>
              <div style={styles.cardBody}>
                {currentPreview ? (
                  currentPreview.isIncomplete ? (
                    <div style={styles.incompleteCard}>
                      <div style={styles.incompleteTitle}>Please
   enter a fuller idea</div>
                      <div style={styles.incompleteBody}>
                        Add what the AI would do, what data or
  workflow it would use, and who it would help.
                      </div>
                      <div style={styles.incompleteExamples}>
                        Example: &quot;Use AI to summarize
  ServiceNow tickets and suggest routing for human review.&quot;
                      </div>
                    </div>
                  ) : (
                    <div style={styles.previewStack}>
                      <ScoreRow label="Impact"
  score={currentPreview.impact} icon={BarChart3}
  blurb={currentPreview.explanations.impact} />
                      <ScoreRow label="Feasibility"
  score={currentPreview.feasibility} icon={BadgeCheck}
  blurb={currentPreview.explanations.feasibility} />
                      <ScoreRow label="Time to Value"
  score={currentPreview.timeToValue} icon={Clock3}
  blurb={currentPreview.explanations.timeToValue} />
                      <ScoreRow label="Effort (reversed)"
  score={currentPreview.effort} icon={Wrench}
  blurb={currentPreview.explanations.effort} />

                      <div style={styles.totalCard}>
                        <div>
                          <div style={styles.totalLabel}>Overall
   score</div>
                          <div
  style={styles.totalValue}>{currentPreview.total}/20</div>
                        </div>
                        <div
  style={styles.totalBadge}>{currentPreview.overallLabel}</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div style={styles.emptyState}>Start typing an
   idea to preview the score and rationale.</div>
                )}
              </div>
            </section>
          </motion.div>

          <div className="bottom-grid"
  style={styles.bottomGrid}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.headerRow}>
                  <div style={{ ...styles.headerIconWrap,
  ...styles.trophyIconWrap }}>
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h2 style={styles.cardTitle}>Top 3
  ideas</h2>
                    <p style={styles.subtitle}>Automatically
  ranked by total score.</p>
                  </div>
                </div>
              </div>
              <div style={styles.cardBody}>
                {top3.length > 0 ? (
                  <div style={styles.stackMd}>
                    {top3.map((item) => (
                      <div key={item.id}
  style={styles.topIdeaCard}>
                        <div style={styles.betweenRow}>
                          <div>
                            <div style={styles.badgeRow}>
                              <span style={{ ...styles.badge,
  ...styles.primaryBadge }}>#{item.rank}</span>
                              <span
  style={styles.badgeMuted}>{item.categoryLabel}</span>
                            </div>
                            <div
  style={styles.metaText}>{item.teamName}</div>
                            <div
  style={styles.ideaText}>{item.idea}</div>
                          </div>
                          <div style={styles.scoreColumn}>
                            <div
  style={styles.metaText}>Score</div>
                            <div
  style={styles.scoreBig}>{item.score.total}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>Submitted ideas
   will appear here once teams begin entering ideas.</div>
                )}
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>All
  submissions</h2>
                <p style={styles.subtitle}>Each idea includes
  its category, total score, and breakdown.</p>
              </div>
              <div style={styles.cardBody}>
                {rankedIdeas.length > 0 ? (
                  <div style={styles.stackMd}>
                    {rankedIdeas.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        style={styles.submissionCard}
                      >
                        <div style={styles.betweenWrapRow}>
                          <div style={styles.badgeRow}>
                            <span style={{ ...styles.badge,
  ...styles.successBadge }}>Rank #{item.rank}</span>
                            <span
  style={styles.badgeMuted}>{item.categoryLabel}</span>
                            <span
  style={styles.badgeOutline}>{item.teamName}</span>
                          </div>
                          <div
  style={styles.totalChip}>{item.score.total}/20</div>
                        </div>

                        <div
  style={styles.ideaText}>{item.idea}</div>
                        <div style={styles.metaText}>Pain point:
   {item.painPointSummary}</div>

                        <div className="metric-grid"
  style={styles.metricGrid}>
                          <MiniMetric title="Impact"
  value={item.score.impact} />
                          <MiniMetric title="Feasibility"
  value={item.score.feasibility} />
                          <MiniMetric title="Time to Value"
  value={item.score.timeToValue} />
                          <MiniMetric title="Effort (rev.)"
  value={item.score.effort} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>No ideas
  submitted yet.</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  type FieldProps = {
    label: string;
    children: React.ReactNode;
  };

  function Field({ label, children }: FieldProps) {
    return (
      <label style={styles.field}>
        <span style={styles.label}>{label}</span>
        {children}
      </label>
    );
  }

  type ScoreRowProps = {
    label: string;
    score: number;
    icon: LucideIcon;
    blurb: string;
  };

  function ScoreRow({ label, score, icon: Icon, blurb }:
  ScoreRowProps) {
    return (
      <div style={styles.scoreRowCard}>
        <div style={styles.betweenRow}>
          <div style={styles.scoreRowLeft}>
            <div style={styles.iconTile}>
              <Icon size={16} />
            </div>
            <div>
              <div style={styles.scoreLabel}>{label}</div>
              <div style={styles.scoreBlurb}>{blurb}</div>
            </div>
          </div>
          <div style={styles.scoreValue}>{score}/5</div>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${score
  * 20}%` }} />
        </div>
      </div>
    );
  }

  type MiniMetricProps = {
    title: string;
    value: number;
  };

  function MiniMetric({ title, value }: MiniMetricProps) {
    return (
      <div style={styles.miniMetric}>
        <div style={styles.metaText}>{title}</div>
        <div style={styles.miniMetricValue}>{value}/5</div>
      </div>
    );
  }

  const globalCss = `
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif,
  system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  sans-serif; }
    input, textarea, select, button { font: inherit; }
    button { cursor: pointer; }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
    @media (max-width: 1100px) {
      .hero-grid { grid-template-columns: 1fr !important; }
      .bottom-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 760px) {
      .form-grid { grid-template-columns: 1fr !important; }
      .metric-grid { grid-template-columns: repeat(2, minmax(0,
  1fr)) !important; }
    }
    @media (max-width: 560px) {
      .metric-grid { grid-template-columns: 1fr !important; }
    }
  `;

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #cffafe 0%, #ffffff
  45%, #d1fae5 100%)",
      padding: "24px",
    },
    container: {
      maxWidth: "1360px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    heroGrid: {
      display: "grid",
      gridTemplateColumns: "1.2fr 0.8fr",
      gap: "24px",
    },
    bottomGrid: {
      display: "grid",
      gridTemplateColumns: "0.8fr 1.2fr",
      gap: "24px",
    },
    card: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "24px",
      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
      overflow: "hidden",
    },
    heroCard: {
      background: "linear-gradient(135deg, rgba(255,255,255,1)
  0%, rgba(236,254,255,1) 55%, rgba(236,253,245,1) 100%)",
    },
    cardHeader: {
      padding: "24px 24px 0 24px",
    },
    cardBody: {
      padding: "24px",
    },
    headerRow: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    headerIconWrap: {
      width: "52px",
      height: "52px",
      borderRadius: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #06b6d4 0%, #10b981
  100%)",
      color: "white",
      boxShadow: "0 10px 24px rgba(6, 182, 212, 0.22)",
      flexShrink: 0,
    },
    trophyIconWrap: {
      background: "linear-gradient(135deg, #10b981 0%, #06b6d4
  100%)",
    },
    title: {
      margin: 0,
      fontSize: "34px",
      lineHeight: 1.1,
      color: "#0f172a",
      letterSpacing: "-0.03em",
    },
    cardTitle: {
      margin: 0,
      fontSize: "28px",
      lineHeight: 1.15,
      color: "#0f172a",
    },
    subtitle: {
      margin: "8px 0 0 0",
      color: "#475569",
      fontSize: "15px",
      lineHeight: 1.6,
    },
    statusBar: {
      marginBottom: "16px",
      borderRadius: "14px",
      padding: "12px 14px",
      background: "#ecfeff",
      color: "#0f766e",
      fontSize: "14px",
      fontWeight: 600,
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#0f172a",
    },
    input: {
      width: "100%",
      borderRadius: "14px",
      border: "1px solid #cbd5e1",
      padding: "12px 14px",
      background: "white",
      color: "#0f172a",
      outline: "none",
    },
    textarea: {
      width: "100%",
      minHeight: "170px",
      borderRadius: "18px",
      border: "1px solid #cbd5e1",
      padding: "14px 16px",
      background: "white",
      color: "#0f172a",
      outline: "none",
      resize: "vertical",
      lineHeight: 1.55,
    },
    submitError: {
      marginTop: "4px",
      marginBottom: "2px",
      fontSize: "14px",
      fontWeight: 600,
      color: "#b91c1c",
    },
    helperText: {
      marginTop: "8px",
      fontSize: "13px",
      color: "#64748b",
    },
    actionRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      alignItems: "center",
    },
    button: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      borderRadius: "14px",
      padding: "12px 18px",
      background: "linear-gradient(90deg, #0891b2 0%, #10b981
  100%)",
      color: "white",
      fontWeight: 600,
      boxShadow: "0 12px 24px rgba(16, 185, 129, 0.18)",
    },
    secondaryButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      border: "1px solid #cbd5e1",
      borderRadius: "14px",
      padding: "12px 18px",
      background: "white",
      color: "#0f172a",
      fontWeight: 600,
    },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "999px",
      border: "1px solid #bae6fd",
      background: "#ecfeff",
      color: "#0f766e",
      padding: "10px 14px",
      fontSize: "14px",
      fontWeight: 500,
    },
    painPointCard: {
      borderRadius: "20px",
      border: "1px solid #cffafe",
      background: "linear-gradient(90deg, #ecfeff 0%, #ecfdf5
  100%)",
      padding: "20px",
    },
    selectedRow: {
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
    },
    iconTile: {
      width: "36px",
      height: "36px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ecfeff",
      color: "#0f766e",
      flexShrink: 0,
    },
    eyebrow: {
      fontSize: "13px",
      fontWeight: 700,
      color: "#334155",
    },
    sectionHeading: {
      marginTop: "4px",
      fontSize: "20px",
      fontWeight: 700,
      color: "#0f172a",
    },
    bodyText: {
      marginTop: "4px",
      fontSize: "14px",
      lineHeight: 1.6,
      color: "#475569",
    },
    previewStack: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    scoreRowCard: {
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      background: "white",
      padding: "16px",
      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    },
    scoreRowLeft: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
    },
    scoreLabel: {
      fontSize: "15px",
      fontWeight: 700,
      color: "#0f172a",
    },
    scoreBlurb: {
      marginTop: "2px",
      fontSize: "13px",
      lineHeight: 1.5,
      color: "#64748b",
    },
    scoreValue: {
      fontSize: "28px",
      fontWeight: 800,
      color: "#0f172a",
      flexShrink: 0,
    },
    progressTrack: {
      marginTop: "14px",
      width: "100%",
      height: "10px",
      borderRadius: "999px",
      background: "#e2e8f0",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: "999px",
      background: "linear-gradient(90deg, #06b6d4 0%, #10b981
  100%)",
    },
    totalCard: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      borderRadius: "20px",
      padding: "20px",
      color: "white",
      background: "linear-gradient(90deg, #0f766e 0%, #059669
  100%)",
      boxShadow: "0 14px 32px rgba(5, 150, 105, 0.18)",
    },
    totalLabel: {
      fontSize: "13px",
      color: "#cffafe",
    },
    totalValue: {
      fontSize: "42px",
      fontWeight: 800,
      lineHeight: 1.1,
    },
    totalBadge: {
      borderRadius: "999px",
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,0.2)",
      background: "rgba(255,255,255,0.1)",
      fontSize: "14px",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    incompleteCard: {
      borderRadius: "20px",
      border: "1px solid #bae6fd",
      background: "linear-gradient(135deg, #f0fdfa 0%, #ecfeff
  100%)",
      padding: "24px",
    },
    incompleteTitle: {
      fontSize: "20px",
      fontWeight: 800,
      color: "#0f172a",
    },
    incompleteBody: {
      marginTop: "8px",
      fontSize: "14px",
      lineHeight: 1.6,
      color: "#475569",
    },
    incompleteExamples: {
      marginTop: "14px",
      padding: "12px 14px",
      borderRadius: "14px",
      background: "white",
      border: "1px solid #dbeafe",
      color: "#0f766e",
      fontSize: "14px",
      lineHeight: 1.5,
    },
    emptyState: {
      borderRadius: "20px",
      border: "1px dashed #cbd5e1",
      background: "#f8fafc",
      padding: "32px",
      textAlign: "center",
      color: "#64748b",
    },
    stackMd: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    topIdeaCard: {
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      background: "linear-gradient(135deg, #ffffff 0%, #ecfeff
  100%)",
      padding: "16px",
      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    },
    badgeRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      alignItems: "center",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "999px",
      padding: "6px 12px",
      fontSize: "13px",
      fontWeight: 700,
    },
    primaryBadge: {
      background: "#0891b2",
      color: "white",
    },
    successBadge: {
      background: "#059669",
      color: "white",
    },
    badgeMuted: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "999px",
      padding: "6px 12px",
      fontSize: "13px",
      fontWeight: 600,
      background: "#f1f5f9",
      color: "#334155",
    },
    badgeOutline: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "999px",
      padding: "6px 12px",
      fontSize: "13px",
      fontWeight: 600,
      border: "1px solid #cbd5e1",
      color: "#334155",
      background: "white",
    },
    betweenRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
    },
    betweenWrapRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    },
    metaText: {
      marginTop: "10px",
      fontSize: "13px",
      color: "#64748b",
    },
    ideaText: {
      marginTop: "10px",
      fontSize: "15px",
      lineHeight: 1.6,
      color: "#0f172a",
    },
    scoreColumn: {
      textAlign: "right",
      flexShrink: 0,
    },
    scoreBig: {
      fontSize: "36px",
      fontWeight: 800,
      color: "#0f172a",
      lineHeight: 1.1,
    },
    submissionCard: {
      borderRadius: "20px",
      border: "1px solid #e2e8f0",
      background: "white",
      padding: "20px",
      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    },
    totalChip: {
      borderRadius: "14px",
      background: "#ecfeff",
      color: "#0f172a",
      padding: "10px 14px",
      fontWeight: 700,
    },
    metricGrid: {
      marginTop: "18px",
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "12px",
    },
    miniMetric: {
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      padding: "14px",
      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
    },
    miniMetricValue: {
      marginTop: "4px",
      fontSize: "28px",
      fontWeight: 800,
      color: "#0f172a",
    },
  };
