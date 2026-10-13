import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  PieChart, 
  Activity, 
  Megaphone, 
  RefreshCw, 
  Building 
} from 'lucide-react';
import { api } from '../../services/api.js';

export default function AnalyticsOverview() {
  const [stats, setStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [overview, depts, cats, activity] = await Promise.all([
        api.fetchStatsOverview(),
        api.fetchDepartmentStats(),
        api.fetchCategoryStats(),
        api.fetchActivityLog()
      ]);
      setStats(overview);
      setDeptStats(depts);
      setCategoryStats(cats);
      setActivityLog(activity);
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-heading font-semibold text-slate-700">Aggregating real-time campus event analytics...</p>
      </div>
    );
  }

  // Calculate highest department for bar ratio
  const maxDeptCount = deptStats.length > 0 ? Math.max(...deptStats.map(d => d.count), 1) : 1;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Event Coordination Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Real-time participant counts, attendance rates, department engagement, and capacity metrics.
          </p>
        </div>

        <button
          onClick={fetchAllStats}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-heading font-semibold shadow-sm hover:shadow transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards with Glassmorphism and Hover Lift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Events */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">Total Events</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">{stats.total_events}</span>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {stats.active_events} Active
              </span>
              <span className="text-slate-500 font-normal">
                {stats.completed_events} Completed
              </span>
            </div>
          </div>
        </div>

        {/* Total Registrations */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">Registrations</span>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">{stats.total_registrations}</span>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-normal">
              <span className="font-semibold text-brand-600">{stats.unique_participants}</span>
              <span>unique student attendees</span>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">{stats.attendance_rate}%</span>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-normal">
              <span className="font-semibold text-emerald-700">{stats.checked_in_count}</span>
              <span>attendees checked in live</span>
            </div>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">Seat Utilization</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">{stats.capacity_utilization_rate}%</span>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-normal">
              <span>Total capacity: </span>
              <span className="font-semibold text-slate-800">{stats.total_capacity} seats</span>
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Participation Bar Chart (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                Department Participation Breakdown
              </h3>
              <p className="text-xs text-slate-500 font-light">Distribution of registered attendees across academic branches</p>
            </div>
            <Building className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
            {deptStats.map((item, idx) => {
              const percentage = Math.round((item.count / maxDeptCount) * 100);
              return (
                <div key={item.department} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-heading">
                    <span className="font-semibold text-slate-800 truncate max-w-xs text-xs sm:text-sm">{item.department}</span>
                    <span className="font-bold text-brand-600 shrink-0 font-mono text-xs sm:text-sm">{item.count} students</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0 
                          ? 'bg-gradient-to-r from-brand-600 to-indigo-500' 
                          : idx === 1 
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-400' 
                          : 'bg-gradient-to-r from-violet-400 to-purple-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown & Distribution */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                Events by Category
              </h3>
              <p className="text-xs text-slate-500 font-light">Portfolio diversity & volume</p>
            </div>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between transition-colors">
                <div>
                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 block">{cat.category}</span>
                  <span className="text-[11px] text-slate-500 font-normal">{cat.total_registered} registered</span>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold font-heading border border-brand-200/60">
                    {cat.event_count} {cat.event_count === 1 ? 'Event' : 'Events'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Live Activity Stream Feed */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Live Event Activity Stream
            </h3>
          </div>
          <Activity className="w-5 h-5 text-slate-400" />
        </div>

        <div className="divide-y divide-slate-100">
          {activityLog.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center font-light">No recent activity logged.</p>
          ) : (
            activityLog.map((act, index) => (
              <div key={index} className="py-3.5 flex items-center justify-between gap-4 text-xs group hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    act.type === 'registration'
                      ? 'bg-brand-50 text-brand-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {act.type === 'registration' ? <Users className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                  </div>

                  <div>
                    <span className="font-heading font-bold text-slate-900">{act.title}</span>
                    <span className="text-slate-600 ml-1.5 font-normal">
                      {act.type === 'registration' ? `registered for ${act.subtitle}` : `published: ${act.subtitle}`}
                    </span>
                  </div>
                </div>

                <span className="text-slate-400 text-[11px] shrink-0 font-mono font-medium">
                  {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
