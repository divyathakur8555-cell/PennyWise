
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// Chart colors
const colors = [
  "#38A3E0",
  "#A78BFA",
  "#FB923C",
  "#F472B6",
  "#4ADE80",
  "#FACC15",
  "#2DD4BF",
  "#818CF8",
  "#FB7185",
  "#94A3B8",
  "#E879F9",
  "#A3E635",
];

// Currency formatter
const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

// Get category totals
function getCategoryData(items, type) {
  const totals = {};

  items
    .filter(
      (item) =>
        item.type === type &&
        Number(item.amount) > 0
    )
    .forEach((item) => {
      const category = item.category || "Other";

      totals[category] =
        (totals[category] || 0) + Number(item.amount);
    });

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Create pie chart slice
function getWedgePath(cx, cy, radius, start, end) {
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);

  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);

  const largeArc = end - start > Math.PI ? 1 : 0;

  return `
    M ${cx} ${cy}
    L ${x1} ${y1}
    A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
    Z
  `;
}

// Reusable Income and Expense Pie Chart
function CategoryPieChart({
  items,
  type,
  title,
  subtitle,
  accent,
}) {
  const categories = getCategoryData(items, type);

  const total = categories.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  if (!categories.length || total <= 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>

        <div className="flex h-64 items-center justify-center text-center">
          <p className="text-sm text-slate-500">
            No {type} transactions available yet.
          </p>
        </div>
      </section>
    );
  }

  const cx = 115;
  const cy = 115;
  const radius = 94;

  let currentAngle = -Math.PI / 2;

  const slices = categories.map((item, index) => {
    const angle = (item.amount / total) * Math.PI * 2;

    const start = currentAngle;
    const end = currentAngle + angle;

    currentAngle = end;

    return {
      ...item,
      color: colors[index % colors.length],
      percentage: (item.amount / total) * 100,
      start,
      end,
    };
  });

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      {/* Total Amount */}
      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-medium text-slate-500">
          Total {type === "income" ? "Income" : "Expenses"}
        </p>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h3 className={`text-2xl font-bold ${accent}`}>
            {formatMoney(total)}
          </h3>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {categories.length} Categories
          </span>
        </div>
      </div>

      {/* Chart and Category Details */}
      <div className="grid items-center gap-5 lg:grid-cols-2">

        {/* Pie Chart */}
        <div className="mx-auto w-full max-w-[250px]">
          <svg
            viewBox="0 0 230 230"
            className="h-auto w-full"
            role="img"
            aria-label={`${title} pie chart`}
          >
            <circle
              cx={cx}
              cy={cy}
              r={radius + 3}
              fill="#F1F5F9"
            />

            {slices.length === 1 ? (
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill={slices[0].color}
              >
                <title>
                  {slices[0].category}: {formatMoney(slices[0].amount)} (100%)
                </title>
              </circle>
            ) : (
              slices.map((slice) => (
                <path
                  key={slice.category}
                  d={getWedgePath(
                    cx,
                    cy,
                    radius,
                    slice.start,
                    slice.end
                  )}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-opacity duration-200 hover:opacity-75"
                >
                  <title>
                    {slice.category}: {formatMoney(slice.amount)} (
                    {slice.percentage.toFixed(1)}%)
                  </title>
                </path>
              ))
            )}

            {/* Centre Circle */}
            <circle
              cx={cx}
              cy={cy}
              r="42"
              fill="#FFFFFF"
            />

            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              fill="#64748B"
              fontSize="11"
            >
              Total
            </text>

            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              fill="#172554"
              fontSize="12"
              fontWeight="bold"
            >
              {total >= 100000
                ? `₹${(total / 100000).toFixed(1)}L`
                : total >= 1000
                ? `₹${(total / 1000).toFixed(1)}k`
                : formatMoney(total)}
            </text>
          </svg>
        </div>

        {/* Category Details */}
        <div className="min-w-0 space-y-4">
          {slices.map((slice) => (
            <div key={slice.category}>

              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: slice.color,
                    }}
                  />

                  <span className="truncate text-sm font-semibold text-slate-700">
                    {slice.category}
                  </span>
                </div>

                <span className="shrink-0 text-sm font-bold text-slate-800">
                  {slice.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${slice.percentage}%`,
                    backgroundColor: slice.color,
                  }}
                />
              </div>

              {/* Amount */}
              <p className="text-xs font-medium text-slate-500">
                {formatMoney(slice.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">
          Total {type === "income" ? "income" : "expenses"}
        </span>

        <span className="text-base font-bold text-slate-800">
          {formatMoney(total)}
        </span>
      </div>
    </section>
  );
}

// Monthly Income vs Expenses Bar Chart
export function IncomeExpenseChart({ items }) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();

    date.setDate(1);
    date.setMonth(date.getMonth() - 5 + index);

    return date;
  });

  const getMonthlyTotal = (type, month) =>
    items
      .filter((item) => {
        const date = new Date(item.date);

        return (
          date.getMonth() === month.getMonth() &&
          date.getFullYear() === month.getFullYear() &&
          item.type === type
        );
      })
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

  const incomeData = months.map((month) =>
    getMonthlyTotal("income", month)
  );

  const expenseData = months.map((month) =>
    getMonthlyTotal("expense", month)
  );

  if (
    incomeData.every((value) => value === 0) &&
    expenseData.every((value) => value === 0)
  ) {
    return (
      <div className="flex h-56 items-center justify-center text-center">
        <p className="text-sm text-slate-500">
          Add income and expenses to see your monthly comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Bar
        data={{
          labels: months.map((date) =>
            date.toLocaleString("en-IN", {
              month: "short",
            })
          ),

          datasets: [
            {
              label: "Income",
              data: incomeData,
              backgroundColor: "#38A3E0",
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: "Expenses",
              data: expenseData,
              backgroundColor: "#FB923C",
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "#475569",
                usePointStyle: true,
                padding: 16,
              },
            },

            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.dataset.label}: ${formatMoney(context.raw)}`,
              },
            },
          },

          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "#64748B",
              },
            },

            y: {
              beginAtZero: true,
              grid: {
                color: "#E2E8F0",
              },
              ticks: {
                color: "#64748B",
                callback: (value) => `₹${value}`,
              },
            },
          },
        }}
      />
    </div>
  );
}

// Income Breakdown
export function IncomeChart({ items }) {
  return (
    <CategoryPieChart
      items={items}
      type="income"
      title="Income Breakdown"
      subtitle="Where your money comes from"
      accent="text-sky-600"
    />
  );
}

// Expense Breakdown
export function ExpenseChart({ items }) {
  return (
    <CategoryPieChart
      items={items}
      type="expense"
      title="Expense Breakdown"
      subtitle="Where your money is spent"
      accent="text-orange-600"
    />
  );
}
