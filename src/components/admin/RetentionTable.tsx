import type { RetentionCohort } from "@/lib/adminQueries";

interface RetentionTableProps {
  data: RetentionCohort[];
}

function retentionColor(rate: number): string {
  if (rate >= 0.5) return "bg-emerald-50 text-emerald-700";
  if (rate >= 0.25) return "bg-amber-50 text-amber-700";
  if (rate > 0) return "bg-red-50 text-red-600";
  return "text-stone-300";
}

function formatPercent(count: number, total: number): string {
  if (total === 0) return "-";
  return `${Math.round((count / total) * 100)}%`;
}

export function RetentionTable({ data }: RetentionTableProps) {
  if (data.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Retention Cohorts
        </p>
        <div className="flex items-center justify-center text-stone-400 text-xs h-20">
          No cohort data yet
        </div>
      </div>
    );
  }

  // Show most recent cohorts first, limit to 14
  const recentCohorts = [...data].reverse().slice(0, 14);

  return (
    <div>
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
        Retention Cohorts
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left py-1 pr-2 font-semibold text-stone-500">
                Cohort
              </th>
              <th className="text-right py-1 px-2 font-semibold text-stone-500">
                Users
              </th>
              <th className="text-right py-1 px-2 font-semibold text-stone-500">
                D1
              </th>
              <th className="text-right py-1 px-2 font-semibold text-stone-500">
                D7
              </th>
              <th className="text-right py-1 px-2 font-semibold text-stone-500">
                D30
              </th>
            </tr>
          </thead>
          <tbody>
            {recentCohorts.map((cohort) => {
              const d1Rate =
                cohort.cohortSize > 0 ? cohort.d1 / cohort.cohortSize : 0;
              const d7Rate =
                cohort.cohortSize > 0 ? cohort.d7 / cohort.cohortSize : 0;
              const d30Rate =
                cohort.cohortSize > 0 ? cohort.d30 / cohort.cohortSize : 0;

              return (
                <tr
                  key={cohort.cohortDate}
                  className="border-b border-stone-100"
                >
                  <td className="py-1 pr-2 font-medium text-stone-600">
                    {cohort.cohortDate}
                  </td>
                  <td className="py-1 px-2 text-right font-bold text-stone-600">
                    {cohort.cohortSize}
                  </td>
                  <td className="py-1 px-2 text-right">
                    <span
                      className={`px-1.5 py-0.5 rounded ${retentionColor(d1Rate)} font-bold`}
                    >
                      {formatPercent(cohort.d1, cohort.cohortSize)}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-right">
                    <span
                      className={`px-1.5 py-0.5 rounded ${retentionColor(d7Rate)} font-bold`}
                    >
                      {formatPercent(cohort.d7, cohort.cohortSize)}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-right">
                    <span
                      className={`px-1.5 py-0.5 rounded ${retentionColor(d30Rate)} font-bold`}
                    >
                      {formatPercent(cohort.d30, cohort.cohortSize)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
