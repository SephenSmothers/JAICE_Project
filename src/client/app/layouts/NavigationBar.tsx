// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./landing-components/"
// import public from "/asset-filename.ext"

import Button from "@/client/global-components/button";
import { Outlet, useNavigate } from "react-router";

export function NavigationBar() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0">
      <div className="fixed group left-0 w-[5rem] hover:w-[15rem] h-full bg-blue-950 flex flex-col items-center p-2 gap-2">
        <div className="">
          <h2 className="text-2xl font-bold">JAICE</h2>
        </div>
        <hr className="w-full border-t-2 border-gray-400 my-2" />
        <div className="flex flex-col items-center h-full w-full justify-between group-hover:items-start">
          
          <div className="flex flex-col items-start gap-2">
            <Button onClick={() => navigate("/home")}>Ho</Button>
            <Button onClick={() => navigate("/about")}>Ab</Button>
            <Button onClick={() => navigate("/dashboard")}>Da</Button>
          </div>
          
          <div className="flex flex-col items-start gap-2">
            <Button onClick={() => navigate("/settings/account")}>Acc</Button>
            <Button onClick={() => navigate("/settings/accessibility")}>Ac</Button>
            <Button onClick={() => navigate("/settings/notification")}>No</Button>
            <Button onClick={() => navigate("/")}>Q</Button>
          </div>
        </div>
      </div>
      <main className="ml-[5rem] h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
