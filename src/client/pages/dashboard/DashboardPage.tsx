// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./dashboard-components/"
// import public from "/asset-filename.ext"
import { ApplicationsByStageCard, SplitByStageCard } from "./DashboardStageCards";
//import { JobStatsProvider } from "@/client/state/useJobStats";


export function DashboardPage() {

  return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-4 bg-orange-300"
    style={{background: "var(--color-bg)"}}>
      <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ApplicationsByStageCard />
            <SplitByStageCard />
          </div>
        </main>
    </div>
  );
}





// export default function DashboardPage() {
//   // If your board lives elsewhere, ensure JobStatsProvider wraps BOTH pages.
//   return (
//     <JobStatsProvider>
//       <div className="w-full h-full bg-slate-950 text-slate-100">
//         <main className="mx-auto max-w-6xl px-6 py-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <ApplicationsByStageCard />
//             <SplitByStageCard />
//           </div>
//         </main>
//       </div>
//     </JobStatsProvider>
//   );
// }
