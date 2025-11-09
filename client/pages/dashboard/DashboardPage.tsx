import {
  GritCard,
  AppsByCategoryCard,
  AppsOverTimeCard,
  AppsByStageCard,
  SplitByStageCard,
  AvgTimeInStageCard,
  AvgAppsPerWeekCard,
} from "./dashboard-components";

export function DashboardPage() {
  return (
    <div className="w-full h-full overflow-hidden">
      {/* Content Grid */}
      <main className={[
        // Space so NavBar doesn't cover content
        "pl-[11rem]",
        // page padding"
        "px-5 py-6",
        // full canvas
        "w-full h-full",
      ].join(" ")}
      >
        {/* 2 x 3 card grid */}
        <section className={[
          "w-full h-full",
          "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 grid-rows-2 gap-6",
        ].join(" ")}
        >
          <AppsOverTimeCard className="h-full" />          
          <AppsByCategoryCard className="h-full" />          
          <SplitByStageCard className="h-full" />          
          <AvgTimeInStageCard className="h-full" />          
        </section>
      </main>
    </div>
  )
}

export default DashboardPage;