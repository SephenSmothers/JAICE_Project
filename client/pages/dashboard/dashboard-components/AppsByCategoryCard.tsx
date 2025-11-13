import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { Card, ChartHost } from "./Card";
import { Modal } from "./Modal";
import { makeDarkOptions, c, ca } from "./chartTheme";
import { applyChartDefaults } from "./chartSetup";

export function AppsByCategoryCard({ className = "", height }: { className?: string; height?: number | string }) {
    const [open, setOpen] = useState(false);
    useEffect(() => applyChartDefaults(), []);

    const labels = ["Engineering", "Design", "Data", "Operations", "Other"];
    const values = [14, 9, 7, 5, 3];

    const colors = {
        barFill: ca("--color-teal-rgb", 0.55),
        barLine: c("--color-teal-rgb"),
        grid: "rgba(148,163,184,0.18)",
        ticks: "#E5E7EB",
        legend: "F3F4F6",
        axis: "rgba(203,213,225,0.35)",
        tooltipBg: "rgba(17,24,39,0.95)",
    };

    const data: ChartData<"bar"> = {
        labels,
        datasets: [
            {
                label: "Applications",
                data: values,
                backgroundColor: colors.barFill,
                borderColor: colors.barLine,
                borderWidth: 3,
                borderRadius: 10,
                borderSkipped: false,
                barThickness: 22,
                hoverBackgroundColor: ca("--color-teal-rgb", 0.7),
                hoverBorderColor: colors.barLine,
                hoverBorderWidth: 3,
            },
        ],
    };

    const options: ChartOptions<"bar"> = makeDarkOptions<"bar">({
        indexAxis: "y",
        plugins: {
            legend: { labels: { color: colors.legend, usePointStyle: true, boxWidth: 10 } },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "rgba(255,255,255,0.18)",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                suggestedMax: Math.max(...values) + 2,
                ticks: { color: colors.ticks, font: { size: 12, weight: 500 } },
                grid: { color: colors.grid },
                border: { color: colors.axis },
            },
            y: {
                ticks: { color: colors.ticks, font: { size: 12, weight: 600 } },
                grid: { display: false },
                border: { color: colors.axis },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    });

    return (
        <>
            <Card
                title="Apps by Category"
                subtitle="Top categories this year"
                className={`${className} cursor-pointer`}
                height={height ?? "18rem"}
                expandable
                onExpand={() => setOpen(true)}
            >
                <ChartHost><Bar data={data} options={options} /></ChartHost>
            </Card>

            <Modal open={open} onClose={() => setOpen(false)} title="Apps by Category">
                <ChartHost><Bar data={data} options={options} /></ChartHost>
            </Modal>
        </>
    );
}

export default AppsByCategoryCard;
