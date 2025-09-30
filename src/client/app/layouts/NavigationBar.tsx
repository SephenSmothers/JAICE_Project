// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./landing-components/"
// import public from "/asset-filename.ext"

import Button from "@/client/global-components/button";
import { Outlet, useNavigate } from "react-router";
import { useState } from "react";

export function NavigationBar() {
  const navigate = useNavigate();
  const [selectedButton, setSelectedButton] = useState<string>("");

  const handleButtonClick = (route: string, buttonId: string) => {
    setSelectedButton(buttonId);
    navigate(route);
  };

  return (
    <div className="fixed inset-0">
      <div className="fixed group left-0 w-[5rem] hover:w-[15rem] h-full bg-blue-950 flex flex-col items-center p-2 gap-2">
        <div className="">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-title)' }}>JAICE</h2>
        </div>
        <hr className="w-full border-t-2 border-gray-400 my-2" />
        <div className="flex flex-col items-center h-full w-full justify-between group-hover:items-start">
          
          <div className="flex flex-col items-start gap-2" style={{ fontFamily: 'var(--font-subheading)' }}>
            <Button onClick={() => handleButtonClick("/home", "home")}
              isSelected={selectedButton === "home"}
              >Ho</Button>

            <Button onClick={() => handleButtonClick("/about", "about")}
              isSelected={selectedButton === "about"}
              >Ab</Button>

            <Button onClick={() => handleButtonClick("/dashboard", "dashboard")}
              isSelected={selectedButton === "dashboard"}
              >Da</Button>
          </div>
          
          <div className="flex flex-col items-start gap-2" style={{ fontFamily: 'var(--font-subheading)' }}>
            <Button onClick={() => handleButtonClick("/settings/account", "account")}
              isSelected={selectedButton === "account"}
              >Acc</Button>

            <Button onClick={() => handleButtonClick("/settings/accessibility", "accessibility")}
              isSelected={selectedButton === "accessibility"}
              >Ac</Button>

            <Button onClick={() => handleButtonClick("/settings/notification", "notification")}
              isSelected={selectedButton === "notification"}
              >No</Button>

            <Button onClick={() => handleButtonClick("/", "quit")}
              isSelected={selectedButton === "quit"}
              >Q</Button>
          </div>
        </div>
      </div>
      <main className="ml-[5rem] h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
