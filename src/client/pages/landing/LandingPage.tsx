// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./landing-components/"
// import public from "/asset-filename.ext"

import Button from "@/client/global-components/button";
import { useNavigate } from "react-router";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex fixed inset-0 justify-center items-center overflow-auto bg-purple-300">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">Landing Page</h1>
        <Button onClick={() => navigate("/home")}>Go to Home Page</Button>
      </div>
    </div>
  );
}
