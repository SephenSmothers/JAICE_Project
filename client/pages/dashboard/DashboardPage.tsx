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
    <div className="w-full h-full flex justify-center">
      {/* Content Grid */}
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Row 1 */}
          {/* Row 1 */}
          {/* Right column stack (two half-height cards) */}
          <div className="lg:cols-span-1 grid grid-rows-2 gap-6">

          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage;