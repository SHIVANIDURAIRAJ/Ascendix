import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Database,
  Cpu,
  Network,
  Code2,
  Layers,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
  HelpCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { assessmentService } from '../services/assessmentService';

export default function AssessmentsPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizTimer, setQuizTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Icon mapper
  const topicIcons = {
    dbms: Database,
    os: Cpu,
    cn: Network,
    dsa: Code2,
    'system-design': Layers,
  };

  useEffect(() => {
    loadTopics();
  }, []);

  // Timer interval when active quiz is running
  useEffect(() => {
    let interval = null;
    if (activeQuiz && !quizResult) {
      interval = setInterval(() => {
        setQuizTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, quizResult]);

  async function loadTopics() {
    try {
      setLoading(true);
      const res = await assessmentService.getTopics();
      if (res && res.data) {
        setTopics(res.data);
      }
    } catch (err) {
      console.error('Failed to load assessment topics:', err);
      setErrorMsg('Failed to load assessment topics. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function startQuiz(topicId) {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await assessmentService.getQuiz(topicId);
      if (res && res.data) {
        setActiveQuiz(res.data);
        setCurrentQIndex(0);
        setSelectedAnswers({});
        setQuizTimer(0);
        setQuizResult(null);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setErrorMsg('Failed to load quiz questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(questionId, optionIndex) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }

  async function handleSubmitQuiz() {
    if (!activeQuiz) return;
    try {
      setSubmitting(true);
      const res = await assessmentService.submitQuiz(
        activeQuiz.topic_id,
        selectedAnswers,
        quizTimer
      );
      if (res && res.data) {
        setQuizResult(res.data);
        // Refresh topics list in background to reflect new scores
        loadTopics();
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      setErrorMsg('Submission error. Please ensure answers are selected.');
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // --------------------------------------------------------------------------
  // RENDER: Active Quiz Runner
  // --------------------------------------------------------------------------
  if (activeQuiz && !quizResult) {
    const questions = activeQuiz.questions || [];
    const currentQ = questions[currentQIndex];
    const totalQ = questions.length;
    const isAnswered = selectedAnswers[currentQ?.question_id] !== undefined;
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPct = Math.round(((currentQIndex + 1) / totalQ) * 100);

    return (
      <DashboardShell>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quiz Header Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase' }}>
                Skill Calibration Assessment
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>
                {activeQuiz.title}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFF2EE',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  color: '#C2410C',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <Clock size={16} />
                <span>{formatTime(quizTimer)}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit this quiz? Unsaved progress will be lost.')) {
                    setActiveQuiz(null);
                  }
                }}
              >
                Exit Quiz
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  backgroundColor: '#FF6B4A',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
              Question {currentQIndex + 1} of {totalQ}
            </span>
          </div>

          {/* Question Card */}
          {currentQ && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Badge variant="primary" size="sm">
                  {currentQ.difficulty || 'Medium'} Difficulty
                </Badge>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {answeredCount} of {totalQ} answered
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', lineHeight: 1.4, margin: '0 0 24px 0' }}>
                {currentQ.question_text}
              </h3>

              {/* Options List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentQ.options?.map((optText, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.question_id] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.question_id, optIdx)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#FF6B4A' : '#E2E8F0'}`,
                        backgroundColor: isSelected ? '#FFF8F6' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#FF6B4A' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {optionLetters[optIdx]}
                      </div>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? '#0F172A' : '#334155',
                          lineHeight: 1.4,
                        }}
                      >
                        {optText}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quiz Navigation Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '28px',
                  paddingTop: '20px',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                >
                  Previous Question
                </Button>

                {currentQIndex < totalQ - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentQIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting & Calibrating...' : 'Submit Calibration Quiz'}
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>
      </DashboardShell>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Quiz Submission Results View
  // --------------------------------------------------------------------------
  if (quizResult) {
    const score = quizResult.score_percentage;
    const tierColor = score >= 80 ? '#059669' : score >= 60 ? '#2563EB' : '#DC2626';

    return (
      <DashboardShell>
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Result Hero Header */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: score >= 70 ? '#DCFCE7' : '#FEE2E2',
                color: tierColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Award size={36} />
            </div>

            <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'primary' : 'danger'} size="md">
              {quizResult.performance_tier}
            </Badge>

            <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#0F172A', margin: '12px 0 6px 0' }}>
              {score}%
            </h1>

            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '560px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              {quizResult.feedback_text}
            </p>

            <div
              style={{
                display: 'inline-flex',
                gap: '24px',
                padding: '12px 24px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                color: '#64748B',
                marginBottom: '24px',
              }}
            >
              <span>Topic: <strong style={{ color: '#0F172A' }}>{quizResult.topic_title}</strong></span>
              <span>Correct: <strong style={{ color: tierColor }}>{quizResult.correct_count} / {quizResult.total_questions}</strong></span>
              <span>Time: <strong style={{ color: '#0F172A' }}>{formatTime(quizResult.time_spent_seconds || 0)}</strong></span>
            </div>

            {/* Profile Skill Calibration Notice */}
            {quizResult.calibrated_skills && quizResult.calibrated_skills.length > 0 && (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  maxWidth: '620px',
                  margin: '0 auto 24px auto',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#065F46', margin: 0 }}>
                    Student Profile Skills Calibrated
                  </h4>
                  <p style={{ fontSize: '12px', color: '#047857', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Your empirical score verified competencies in your profile:{' '}
                    <strong>{quizResult.calibrated_skills.join(', ')}</strong>. This calibration feeds directly into your Placement Readiness Score.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link to="/readiness">
                <Button variant="primary" size="md" icon={TrendingUp}>
                  View Updated Readiness Score
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                icon={RotateCcw}
                onClick={() => startQuiz(quizResult.topic_id)}
              >
                Retake Quiz
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setActiveQuiz(null);
                  setQuizResult(null);
                }}
              >
                Back to Topics
              </Button>
            </div>
          </div>

          {/* Detailed Question Explanations */}
          <Card
            icon={BookOpen}
            title="Question-by-Question Solution Review"
            subtitle="Conceptual rationale and official explanations for each question"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {quizResult.question_results?.map((q, idx) => {
                const isCorrect = q.is_correct;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={idx}
                    style={{
                      border: `1px solid ${isCorrect ? '#BBF7D0' : '#FECACA'}`,
                      borderRadius: '12px',
                      padding: '18px 20px',
                      backgroundColor: isCorrect ? '#F0FDF4' : '#FFF8F8',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isCorrect ? (
                          <CheckCircle2 size={18} color="#16A34A" />
                        ) : (
                          <XCircle size={18} color="#DC2626" />
                        )}
                        <span style={{ fontSize: '12px', fontWeight: 800, color: isCorrect ? '#16A34A' : '#DC2626' }}>
                          Question {idx + 1} · {isCorrect ? 'Correct (+20 pts)' : 'Incorrect'}
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      {q.question_text}
                    </h4>

                    {/* Options list showing what was picked */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                      {q.options?.map((opt, oIdx) => {
                        const isStudentChoice = q.selected_option === oIdx;
                        const isActualCorrect = q.correct_option === oIdx;

                        let optBg = '#FFFFFF';
                        let optBorder = '#E2E8F0';
                        if (isActualCorrect) {
                          optBg = '#DCFCE7';
                          optBorder = '#16A34A';
                        } else if (isStudentChoice && !isCorrect) {
                          optBg = '#FEE2E2';
                          optBorder = '#DC2626';
                        }

                        return (
                          <div
                            key={oIdx}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              backgroundColor: optBg,
                              border: `1px solid ${optBorder}`,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#475569' }}>{optionLetters[oIdx]}.</span>
                            <span style={{ flex: 1, color: '#0F172A' }}>{opt}</span>
                            {isActualCorrect && <Check size={14} color="#16A34A" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Conceptual Explanation Box */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        color: '#475569',
                        lineHeight: 1.45,
                      }}
                    >
                      <strong style={{ color: '#0F172A' }}>Recruitment Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>
      </DashboardShell>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Default Topics Grid View
  // --------------------------------------------------------------------------
  return (
    <DashboardShell>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Banner */}
        <div
          className="portal-page-banner"
          style={{
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '20px',
            padding: '28px 32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: 'var(--shadow-md, 0 4px 20px -2px rgba(15, 23, 42, 0.05))',
            background: 'linear-gradient(135deg, var(--bg-card) 60%, var(--bg-subtle) 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="primary" size="sm">Skill Calibration</Badge>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>Empirical Skill Calibration</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', margin: 0 }}>
              Calibration Assessments
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', marginTop: '6px', maxWidth: '640px', lineHeight: 1.5 }}>
              Topic-focused placement calibration quizzes. These are not competitive programming contests — they exist solely to verify your core CS competencies and feed authentic data into your <strong style={{ color: 'var(--text-primary, #0F172A)' }}>Placement Readiness Score</strong>.
            </p>
          </div>

          <Link to="/readiness">
            <Button variant="primary" size="md" icon={BarChart3}>
              View Readiness Score
            </Button>
          </Link>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '13px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Calibration Methodology Explainer Card */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Sparkles size={24} color="#FF6B4A" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.45 }}>
            <strong style={{ color: '#0F172A' }}>How Calibration Works: </strong>
            Taking an assessment verifies your self-reported profile skills (e.g. DBMS, Operating Systems). Your empirical quiz score blends into your profile and directly satisfies the 15% Assessment component of your Placement Readiness formula.
          </div>
        </div>

        {/* 5 Topic Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {topics.map((t) => {
            const IconComponent = topicIcons[t.topic_id] || Database;
            const hasAttempts = t.attempts_count > 0;
            const bestScore = t.best_score;

            return (
              <div
                key={t.topic_id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: '#FFF2EE',
                        color: '#FF6B4A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={22} />
                    </div>

                    <Badge variant={hasAttempts ? (bestScore >= 80 ? 'success' : 'primary') : 'neutral'} size="sm">
                      {hasAttempts ? `Best: ${bestScore}%` : 'Unattempted'}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                    {t.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.45, margin: '0 0 16px 0' }}>
                    {t.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {t.calibrated_skills?.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#94A3B8' }}>
                    <span>{t.question_count || 5} Questions</span>
                    <span>•</span>
                    <span>~{t.estimated_minutes || 6} Mins</span>
                  </div>

                  <Button
                    variant={hasAttempts ? 'outline' : 'primary'}
                    size="sm"
                    icon={ChevronRight}
                    onClick={() => startQuiz(t.topic_id)}
                  >
                    {hasAttempts ? 'Retake Quiz' : 'Start Quiz'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </DashboardShell>
  );
}
