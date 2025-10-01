// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./landing-components/"
// import public from "/asset-filename.ext"

import { useNavigate } from "react-router";
import { LandingForm } from "./landing-components/LandingForm";
import Button from "@/client/global-components/button";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-10 min-h-screen p-[2rem]">
      {/* *Top Container */}
      <div className="flex w-full px-[2rem] py-[4rem] items-center justify-center">
        {/* Inner Container */}
        <div className="flex flex-col items-center gap-5 p-8 justify-center">
          <img src="/vite.svg" className="w-32 h-32 mx-auto" />
          <h1>JAICE</h1>
          <div className="text-left">
            <h1>Job Application Intelligence</h1>
            <h1>& Career Enhancement</h1>
          </div>
          <h2>Simplify Your Job Hunt</h2>
        </div>
      </div>

      {/* *Form Container */}
      <div className="flex w-full  px-[2rem] py-[4rem] items-center justify-center">
        {/* Inner Container */}
        <div className="flex flex-col w-[30rem]">
          <LandingForm />
        </div>
      </div>

      {/* *Floating Button Container */}
      <div className="fixed top-0 left-0 m-4">
        <Button onClick={() => navigate("/about")}>About</Button>
      </div>
    </div>
  );
}
