import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import PaymentModal from '../../components/common/PaymentModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface EventItem {
  title: string;
  category: string;
  date: string;
}

interface PaymentItem {
  status: string;
  amount: number;
  createdAt: string;
}

interface ProgramItem {
  category?: string;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface DashboardData {
  programCount: number;
  nextEvent: EventItem | null;
  isPaidCurrentMonth: boolean;
  totalContributed: number;
  monthlyContributions: ChartPoint[];
  programMix: ChartPoint[];
  recentPaymentRate: number;
}

const MONTHLY_CONTRIBUTION = 1000;
const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const monthKeys = (count: number): Array<{ key: string; label: string }> => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (count - index - 1), 1);
    const year = monthDate.getFullYear();
    const month = `${monthDate.getMonth() + 1}`.padStart(2, '0');
    return {
      key: `${year}-${month}`,
      label: monthDate.toLocaleString('default', { month: 'short' })
    };
  });
};

const buildMonthlyContributions = (payments: PaymentItem[]): ChartPoint[] => {
  const months = monthKeys(6);
  const totals = new Map(months.map((month) => [month.key, 0]));

  payments.forEach((payment) => {
    if (payment.status !== 'Completed') return;
    const date = new Date(payment.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + payment.amount);
    }
  });

  return months.map((month) => ({
    label: month.label,
    value: totals.get(month.key) ?? 0
  }));
};

const buildProgramMix = (programs: ProgramItem[]): ChartPoint[] => {
  const categoryTotals = new Map<string, number>();
  programs.forEach((program) => {
    const category = (program.category ?? 'General').trim() || 'General';
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + 1);
  });

  return Array.from(categoryTotals.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

const calculateRecentPaymentRate = (payments: PaymentItem[]): number => {
  const months = monthKeys(6);
  const paidSet = new Set<string>();

  payments.forEach((payment) => {
    if (payment.status !== 'Completed') return;
    const date = new Date(payment.createdAt);
    if (Number.isNaN(date.getTime())) return;
    paidSet.add(`${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`);
  });

  const paidMonths = months.filter((month) => paidSet.has(month.key)).length;
  return Math.round((paidMonths / months.length) * 100);
};

const AreaChart: React.FC<{ data: ChartPoint[] }> = ({ data }) => {
  const width = 360;
  const height = 160;
  const padding = 12;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  const points = data
    .map((point, index) => {
      const x = padding + index * step;
      const y = padding + chartHeight - (point.value / maxValue) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPath = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <defs>
          <linearGradient id="contributionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <polyline fill="url(#contributionGradient)" stroke="none" points={areaPath} />
        <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" points={points} />
      </svg>
      <div className="grid grid-cols-6 gap-2 text-xs text-gray-500">
        {data.map((point) => (
          <div key={point.label} className="text-center">
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const DonutChart: React.FC<{ data: ChartPoint[] }> = ({ data }) => {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
      {data.map((point, index) => {
        const ratio = total === 0 ? 0 : point.value / total;
        const dash = ratio * circumference;
        const segment = (
          <circle
            key={point.label}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth="14"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 60 60)"
            strokeLinecap="round"
          />
        );
        offset += dash;
        return segment;
      })}
      <text x="60" y="56" textAnchor="middle" className="fill-gray-500 text-[9px] uppercase tracking-wide">
        Mix
      </text>
      <text x="60" y="70" textAnchor="middle" className="fill-gray-900 text-sm font-semibold">
        {total}
      </text>
    </svg>
  );
};

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, eventsRes, historyRes] = await Promise.all([
          apiClient.get<ProgramItem[]>('/programs'),
          apiClient.get<EventItem[]>('/events'),
          apiClient.get<PaymentItem[]>('/payments/history')
        ]);

        const programs = programsRes.data;
        const events = eventsRes.data;
        const payments = historyRes.data;
        const now = new Date();

        const totalContributed = payments
          .filter((payment) => payment.status === 'Completed')
          .reduce((sum, payment) => sum + payment.amount, 0);

        const isPaidCurrentMonth = payments.some((payment) => {
          if (payment.status !== 'Completed') return false;
          const paymentDate = new Date(payment.createdAt);
          return (
            paymentDate.getMonth() === now.getMonth() &&
            paymentDate.getFullYear() === now.getFullYear()
          );
        });

        const nextEvent =
          events
            .filter((event) => new Date(event.date).getTime() >= now.getTime())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;

        setData({
          programCount: programs.length,
          nextEvent,
          isPaidCurrentMonth,
          totalContributed,
          monthlyContributions: buildMonthlyContributions(payments),
          programMix: buildProgramMix(programs),
          recentPaymentRate: calculateRecentPaymentRate(payments)
        });
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-8">
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 text-white px-6 py-7 shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Dashboard</p>
              <h2 className="text-2xl font-semibold mt-2">Your community impact at a glance</h2>
              <p className="text-sm text-blue-100 mt-2 max-w-xl">
                Track contributions, welfare growth, and initiative participation in one place.
              </p>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="rounded-lg bg-white text-slate-900 px-5 py-3 text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              {data?.isPaidCurrentMonth ? 'Pay Extra / Advance' : 'Pay Contribution'}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Monthly Contribution</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">Ksh {MONTHLY_CONTRIBUTION.toLocaleString()}</p>
            <span
              className={`inline-block mt-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                data?.isPaidCurrentMonth
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {data?.isPaidCurrentMonth ? `Paid for ${currentMonth}` : `Due for ${currentMonth}`}
            </span>
          </div>

          <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">My Welfare Fund</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              Ksh {data ? Math.round(data.totalContributed * 0.3).toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              30% of total contribution (Ksh {data?.totalContributed.toLocaleString()})
            </p>
          </div>

          <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active Initiatives</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{data?.programCount ?? 0}</p>
            <button
              onClick={() => navigate('/dashboard/programs')}
              className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              View programs
            </button>
          </div>

          <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">6-Month Payment Rate</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{data?.recentPaymentRate ?? 0}%</p>
            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${data?.recentPaymentRate ?? 0}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Contribution trend</h3>
              <p className="text-sm text-gray-500">Last 6 months</p>
            </div>
            <div className="mt-4">
              <AreaChart data={data?.monthlyContributions ?? []} />
            </div>
          </div>

          <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Program mix</h3>
            <div className="mt-5 flex items-center justify-between gap-4">
              <DonutChart data={data?.programMix ?? []} />
              <div className="space-y-3 text-sm">
                {(data?.programMix ?? []).map((point, index) => (
                  <div key={point.label} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-gray-700">{point.label}</span>
                    <span className="text-gray-400">{point.value}</span>
                  </div>
                ))}
                {(data?.programMix ?? []).length === 0 && (
                  <p className="text-gray-500">No programs available yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming event</h3>
            <button
              onClick={() => navigate('/dashboard/events')}
              className="text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              View all events
            </button>
          </div>
          <div className="mt-4">
            {data?.nextEvent ? (
              <button
                onClick={() => navigate('/dashboard/events')}
                className="w-full text-left rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 hover:border-blue-200 transition-colors"
              >
                <p className="font-semibold text-blue-900">{data.nextEvent.title}</p>
                <p className="text-sm text-blue-700 mt-1">{data.nextEvent.category}</p>
                <p className="text-sm text-gray-600 mt-3">
                  {new Date(data.nextEvent.date).toLocaleDateString()}
                </p>
              </button>
            ) : (
              <p className="text-gray-500 italic">No upcoming events scheduled.</p>
            )}
          </div>
        </section>
      </div>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
    </>
  );
};

export default Overview;
