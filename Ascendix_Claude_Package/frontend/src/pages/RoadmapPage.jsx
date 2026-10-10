import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  AlertCircle,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import DashboardShell from '../components/layout/DashboardShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { roadmapService } from '../services/roadmapService';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true, 2: true, 3: true, 4: true });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    try {
      setLoading(true);
      const res = await roadmapService.getRoadmap();
      if (res && res.data) {
        setRoadmap(res.data);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setFeedback({
        type: 'error',
        message: 'Could not load your personalized roadmap. Please verify target role selection.',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleToggleTask = async (taskId) => {
    setTogglingTaskId(taskId);
    setFeedback({ type: '', message: '' });

    try {
      const res = await roadmapService.toggleTask(taskId);
      if (res && res.success) {
        // Optimistically update task in state
        const updatedWeeks = roadmap.weeks.map((week) => ({
          ...week,
          tasks: week.tasks.map((task) =>
            task.task_id === taskId
              ? { ...task, is_completed: res.task.is_completed, completed_at: res.task.completed_at }
              : task
          ),
        }));

        setRoadmap({
          ...roadmap,
          completed_tasks: res.completed_tasks,
          total_tasks: res.total_tasks,
          completion_percentage: res.completion_percentage,
          weeks: updatedWeeks,
        });

        setFeedback({
          type: 'success',
          message: res.task.is_completed
            ? `Milestone marked complete! Progress increased to ${res.completion_percentage}%.`
            : `Task reopened. Progress recalculated to ${res.completion_percentage}%.`,
        });
      }
    } catch (err) {
      console.error('Task toggle error:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to update task state. Please retry.',
      });
    } finally {
      setTogglingTaskId(null);
    }
  };

  const toggleWeekExpand = (weekNum) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  if (loading) {
    return (
      <DashboardShell>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <p style={{ color: '#64748B', fontSize: '15px' }}>Synthesizing personalized weekly curriculum from your skill gaps...</p>
        </div>
      </DashboardShell>
    );
  }

  const completionPct = roadmap?.completion_percentage || 0;
  const totalTasks = roadmap?.total_tasks || 0;
  const completedTasks = roadmap?.completed_tasks || 0;

  // Calculate total hours
  let totalHours = 0;
  let completedHours = 0;
  roadmap?.weeks?.forEach((w) => {
    w.tasks?.forEach((t) => {
      totalHours += t.estimated_hours || 0;
      if (t.is_completed) completedHours += t.estimated_hours || 0;
    });
  });

  return (
    <DashboardShell>
      <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="primary" size="sm">Preparation Schedule</Badge>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Personalized Curriculum</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Personalized Placement Roadmap
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
              Targeting: <strong style={{ color: '#0F172A' }}>{roadmap?.target_role_title || 'Software Developer'}</strong> — Synthesized directly to close your highest-severity skill gaps first.
            </p>
          </div>

          <Link to="/skill-gap">
            <Button variant="outline" size="md">
              View Skill Gaps
            </Button>
          </Link>
        </div>

        {/* Feedback Alert Toast */}
        {feedback.message && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FEE2E2'}`,
              color: feedback.type === 'success' ? '#065F46' : '#DC2626',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Top Progress Overview Card */}
        {roadmap && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '28px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              alignItems: 'center',
              boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
            }}
          >
            {/* Completion Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF2EE',
                  border: '4px solid #FF6B4A',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#C2410C', lineHeight: 1 }}>
                  {completionPct}%
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Cleared
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Roadmap Execution
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  {completedTasks} of {totalTasks} milestones completed
                </p>
                <div style={{ width: '180px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${completionPct}%`, height: '100%', backgroundColor: '#FF6B4A', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px 18px', borderRadius: '12px', flex: 1, minWidth: '100px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Duration
                </span>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0 0' }}>
                  4 Weeks
                </p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '12px 18px', borderRadius: '12px', flex: 1, minWidth: '100px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Estimated Study
                </span>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0 0' }}>
                  {completedHours} / {totalHours}h
                </p>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '12px 18px', borderRadius: '12px', flex: 1, minWidth: '100px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Sequencing
                </span>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#FF6B4A', margin: '4px 0 0 0' }}>
                  Blocker 1st
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Week-by-Week Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {roadmap?.weeks?.map((week) => {
            const isExpanded = expandedWeeks[week.week_number];
            const weekTasks = week.tasks || [];
            const weekCompletedCount = weekTasks.filter((t) => t.is_completed).length;
            const weekPct = weekTasks.length > 0 ? intMath((weekCompletedCount / weekTasks.length) * 100) : 0;

            function intMath(n) { return Math.round(n); }

            return (
              <div
                key={week.week_number}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                }}
              >
                {/* Week Accordion Header */}
                <div
                  onClick={() => toggleWeekExpand(week.week_number)}
                  style={{
                    padding: '20px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? '#FFFDFD' : '#FFFFFF',
                    borderBottom: isExpanded ? '1px solid #F1F5F9' : 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#FFF2EE',
                        color: '#FF6B4A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      W{week.week_number}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF6B4A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Week {week.week_number} Milestone
                        </span>
                        <Badge variant="neutral" size="sm">
                          Focus: {week.focus_skill}
                        </Badge>
                        {weekPct === 100 && (
                          <Badge variant="success" size="sm">
                            Completed ✓
                          </Badge>
                        )}
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {week.theme}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right', display: 'none' }} className="week-progress-preview">
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                        {weekCompletedCount}/{weekTasks.length} Done
                      </span>
                      <div style={{ width: '100px', height: '5px', backgroundColor: '#F1F5F9', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${weekPct}%`, height: '100%', backgroundColor: weekPct === 100 ? '#10B981' : '#FF6B4A', borderRadius: '3px' }} />
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
                  </div>
                </div>

                {/* Week Tasks Expanded List */}
                {isExpanded && (
                  <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F8FAFC' }}>
                    {weekTasks.map((task) => {
                      const isBusy = togglingTaskId === task.task_id;
                      const done = task.is_completed;

                      return (
                        <div
                          key={task.task_id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: `1px solid ${done ? '#A7F3D0' : '#E2E8F0'}`,
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {/* Completion Checkbox Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.task_id)}
                            disabled={isBusy}
                            style={{
                              marginTop: '2px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              backgroundColor: done ? '#10B981' : '#FFFFFF',
                              border: `2px solid ${done ? '#10B981' : '#CBD5E1'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.15s ease',
                            }}
                            title={done ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            {done && <Check size={16} strokeWidth={3} />}
                          </button>

                          {/* Task Content */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                              <h4
                                style={{
                                  fontSize: '15px',
                                  fontWeight: 700,
                                  color: done ? '#64748B' : '#0F172A',
                                  textDecoration: done ? 'line-through' : 'none',
                                  margin: 0,
                                }}
                              >
                                {task.title}
                              </h4>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Badge variant={task.difficulty} size="sm">
                                  {task.difficulty}
                                </Badge>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                                  <Clock size={12} />
                                  {task.estimated_hours}h
                                </span>
                              </div>
                            </div>

                            {/* Subtopics Checklist */}
                            {task.subtopics && task.subtopics.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', marginBottom: '12px' }}>
                                {task.subtopics.map((sub, sIdx) => (
                                  <span
                                    key={sIdx}
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 500,
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: '#F1F5F9',
                                      color: '#475569',
                                    }}
                                  >
                                    • {sub}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Recommended Action Callout */}
                            {task.recommended_action && (
                              <div
                                style={{
                                  backgroundColor: '#FFF8F6',
                                  border: '1px solid #FFE4DE',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '12px',
                                  color: '#C2410C',
                                  fontWeight: 500,
                                }}
                              >
                                <Sparkles size={14} style={{ flexShrink: 0 }} />
                                <span>Action: {task.recommended_action}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
      <style>{`
        @media (min-width: 640px) {
          .week-progress-preview { display: block !important; }
        }
      `}</style>
    </DashboardShell>
  );
}
