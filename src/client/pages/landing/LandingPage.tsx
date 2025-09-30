// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./landing-components/"
// import public from "/asset-filename.ext"

import { LandingForm } from "./landing-components/LandingForm";

export function LandingPage() {
  return (
    <div className="flex fixed inset-0 justify-center items-center overflow-auto">
      <div className="flex flex-col justify-evenly h-full w-full md:flex-row">
        
        <div className="flex flex-col h-3/2 md:h-full w-full md:w-1/2 items-center justify-center gap-3">
          <img src="/vite.svg" className="w-32 h-32 mx-auto" />
          <h1>JAICE</h1>
          <div className="text-left">
            <h2>Job Application Intelligence & Career Enhancement</h2>
            <h3>Simplify Your Job Hunt</h3>
          </div>
        </div>


        <div className="flex h-1/2 w-7/8 md:h-full w-[34rem] items-center justify-center self-center p-20">
          <LandingForm />
        </div>
      </div>
    </div>
  );
}
