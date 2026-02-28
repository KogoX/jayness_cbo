import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalFunds: number;
  activePrograms: number;
}

interface ReviewQueueSummary {
  total: number;
  breached: number;
  byType: {
    payment_reconciliation: number;
    beneficiary_approval: number;
    contact_followup: number;
  };
}

interface ReviewQueueItem {
  type: string;
  id: string;
  title: string;
  detail: string;
  ageHours: number;
  slaHours: number;
  breached: boolean;
}

interface ComplianceReport {
  month: string;
  payments: {
    completedCount: number;
    totalAmount: number;
    receiptsRecorded: number;
  };
  reconciliation: {
    NotChecked: number;
    Matched: number;
    Mismatch: number;
    NeedsReview: number;
  };
  remindersSent: number;
  auditEvents: number;
  slaRiskItems: number;
  automationCoveragePercent: number;
  recordCompletenessPercent: number;
}

interface BarPoint {
  label: string;
  value: number;
  color: string;
}

const KPI_COLORS = ['#2563eb', '#10b981', '#f59e0b'];
const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;
};

const ComparisonBars: React.FC<{ data: BarPoint[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="space-y-4">
      {data.map((point) => (
        <div key={point.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-700">{point.label}</span>
            <span className="font-medium text-gray-900">{point.value.toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(point.value / maxValue) * 100}%`,
                background: `linear-gradient(90deg, ${point.color}, #0f172a)`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const RatioDonut: React.FC<{ users: number; programs: number }> = ({ users, programs }) => {
  const total = users + programs;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const userRatio = total === 0 ? 0 : users / total;
  const userDash = userRatio * circumference;
  const programDash = circumference - userDash;

  return (
    <svg viewBox="0 0 120 120" className="h-36 w-36">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#2563eb"
        strokeWidth="14"
        strokeDasharray={`${userDash} ${circumference - userDash}`}
        transform="rotate(-90 60 60)"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="14"
        strokeDasharray={`${programDash} ${circumference - programDash}`}
        strokeDashoffset={-userDash}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="56" textAnchor="middle" className="fill-gray-500 text-[9px] uppercase tracking-wide">
        Members
      </text>
      <text x="60" y="70" textAnchor="middle" className="fill-gray-900 text-sm font-semibold">
        {users}
      </text>
    </svg>
  );
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewQueueSummary | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewQueueItem[]>([]);
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, queueRes, complianceRes] = await Promise.all([
          apiClient.get<AdminStats>('/admin/stats'),
          apiClient.get<{ summary: ReviewQueueSummary; items: ReviewQueueItem[] }>('/admin/review-queue'),
          apiClient.get<ComplianceReport>(`/admin/compliance/monthly?month=${currentMonthKey()}`),
        ]);
        setStats(statsRes.data);
        setReviewSummary(queueRes.data.summary);
        setReviewItems(queueRes.data.items);
        setCompliance(complianceRes.data);
      } catch (error) {
        console.error('Admin stats failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statsData: BarPoint[] = [
    { label: 'Members', value: stats?.totalUsers ?? 0, color: KPI_COLORS[0] },
    { label: 'Programs', value: stats?.activePrograms ?? 0, color: KPI_COLORS[1] },
    { label: 'Funds (x1,000)', value: Math.round((stats?.totalFunds ?? 0) / 1000), color: KPI_COLORS[2] }
  ];

  const downloadComplianceCsv = async () => {
    try {
      const response = await apiClient.get(`/admin/compliance/monthly?month=${currentMonthKey()}&format=csv`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-${currentMonthKey()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Compliance export failed', error);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-800 text-white px-6 py-7 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Admin Dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold">Organization performance overview</h2>
        <p className="mt-2 max-w-2xl text-sm text-cyan-100">
          Monitor membership growth, fundraising performance, and program activity from one control center.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Members</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalUsers ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Raised</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            Ksh {(stats?.totalFunds ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Active Programs</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.activePrograms ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Review Queue</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{reviewSummary?.total ?? 0} open items</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                (reviewSummary?.breached ?? 0) > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {(reviewSummary?.breached ?? 0) > 0
                ? `${reviewSummary?.breached ?? 0} SLA breached`
                : 'No SLA breach'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Reconciliation</p>
              <p className="font-semibold text-gray-900">
                {reviewSummary?.byType.payment_reconciliation ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Beneficiary Approvals</p>
              <p className="font-semibold text-gray-900">
                {reviewSummary?.byType.beneficiary_approval ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">Contact Follow-ups</p>
              <p className="font-semibold text-gray-900">
                {reviewSummary?.byType.contact_followup ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">KPI comparison</h3>
            <p className="text-sm text-gray-500">Normalized scale</p>
          </div>
          <div className="mt-5">
            <ComparisonBars data={statsData} />
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Member to program ratio</h3>
          <div className="mt-5 flex items-center justify-between gap-4">
            <RatioDonut users={stats?.totalUsers ?? 0} programs={stats?.activePrograms ?? 0} />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span className="text-gray-700">Members</span>
                <span className="text-gray-500">{stats?.totalUsers ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-gray-700">Programs</span>
                <span className="text-gray-500">{stats?.activePrograms ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Priority review queue</h3>
          <button
            onClick={() => navigate('/admin/notifications')}
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Notify team
          </button>
        </div>
        <div className="space-y-3 mb-6">
          {reviewItems.slice(0, 6).map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`rounded-lg border p-3 ${
                item.breached ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-gray-900">{item.title}</p>
                <span className="text-xs text-gray-600">
                  {item.ageHours}h / SLA {item.slaHours}h
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.detail}</p>
            </div>
          ))}
          {reviewItems.length === 0 && (
            <p className="text-sm text-gray-500">No pending review items right now.</p>
          )}
        </div>

      </section>

      <section className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Monthly compliance</h3>
          <button
            onClick={downloadComplianceCsv}
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Export CSV
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500 text-sm">Automation Coverage</p>
            <p className="font-semibold text-gray-900">
              {compliance?.automationCoveragePercent ?? 0}%
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500 text-sm">Record Completeness</p>
            <p className="font-semibold text-gray-900">
              {compliance?.recordCompletenessPercent ?? 0}%
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500 text-sm">Reminders Sent</p>
            <p className="font-semibold text-gray-900">{compliance?.remindersSent ?? 0}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500 text-sm">Audit Events</p>
            <p className="font-semibold text-gray-900">{compliance?.auditEvents ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Quick actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/admin/events')}
            className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Manage Events
          </button>
          <button
            onClick={() => navigate('/admin/programs')}
            className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Manage Programs
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Manage Users
          </button>
          <button
            onClick={() => navigate('/admin/beneficiaries')}
            className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Manage Beneficiaries
          </button>
          <button
            onClick={() => navigate('/admin/notifications')}
            className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Send Broadcast
          </button>
          <button
            onClick={() => navigate('/admin/impact')}
            className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Update Impact Gallery
          </button>
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;
