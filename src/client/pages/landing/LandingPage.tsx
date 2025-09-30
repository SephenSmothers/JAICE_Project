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
    <div className="fixed inset-0 grow bg-blue-900">

      {/* *Primary Container */}
      <div className="flex flex-col w-full gap-5  p-10 bg-blue-600">
        
        {/* *Info Container */}
        <div className="flex flex-col items-center text-center h-1/2 justify-center bg-blue-400">
          <img src="/vite.svg" className="w-32 h-32 mx-auto" />
          <h1>JAICE</h1>
          <div className="text-left">
            <h2>Job Application Intelligence & Career Enhancement</h2>
            <h3>Simplify Your Job Hunt</h3>
          </div>
        </div>

        {/* *Form Container */}
        <div className="bg-blue-400">
          <div className="">
            <LandingForm />
          </div>
        </div>
      </div>

      {/* *Floating Button Container */}
      <div className="fixed top-0 left-0 m-4">
        <Button onClick={() => navigate("/about")}>About</Button>
      </div>
    </div>
  );
}
