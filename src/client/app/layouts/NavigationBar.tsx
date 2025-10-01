// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./landing-components/"
// import public from "/asset-filename.ext"

import Button from "@/client/global-components/button";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";

// Icons
import homeIcon from "@/client/assets/icons/home.svg";
import aboutIcon from "@/client/assets/icons/book-open-cover.svg";
import dashboardIcon from "@/client/assets/icons/chart-pie-alt.svg";
import accountIcon from "@/client/assets/icons/user.svg";
import accessibilityIcon from "@/client/assets/icons/hand-paper.svg";
import notificationIcon from "@/client/assets/icons/bell-notification-social-media.svg";
import quitIcon from "@/client/assets/icons/user-logout.svg";

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedButton, setSelectedButton] = useState<string>("");

  useEffect(() => {
    // Update selected button based on current path
    const path = location.pathname;

    if (path === "/home") {
      setSelectedButton("home");
    } else if (path === "/about") {
      setSelectedButton("about");
    } else if (path === "/dashboard") {
      setSelectedButton("dashboard");
    } else if (path === "/settings/account") {
      setSelectedButton("account");
    } else if (path === "/settings/accessibility") {
      setSelectedButton("accessibility");
    } else if (path === "/settings/notification") {
      setSelectedButton("notification");
    } else setSelectedButton("");
  }, [location.pathname]);

  const handleButtonClick = (route: string, buttonId: string) => {
    setSelectedButton(buttonId);
    navigate(route);
  };

  return (
    <div className="ml-[5rem] h-screen overflow-hidden">
      <nav className="absolute left-0 h-screen">
        <div className="fixed group left-0 w-[5rem] hover:w-[15rem] h-full bg-[var(--color-blue-1)] flex flex-col items-center p-2 gap-2">
          {/* Title */}
          <header>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-title)" }}
            >
              <span
                className="group-hover:hidden"
                style={{ fontFamily: "inherit", fontSize: "inherit" }}
              >
                J
              </span>
              <span
                className="hidden group-hover:inline"
                style={{ fontFamily: "inherit", fontSize: "inherit" }}
              >
                JAICE
              </span>
            </h1>
          </header>

          <hr className="w-full border-t-2 border-gray-400 my-2" />

          <div className="flex flex-col items-center h-full w-full justify-between group-hover:items-start">
            {/* Navigation Buttons */}
            <section aria-label="Navigation Buttons">
              <ul
                className="flex flex-col items-start gap-2"
                style={{ fontFamily: "var(--font-subheading)" }}
              >
                <li>
                  <Button
                    onClick={() => handleButtonClick("/home", "home")}
                    isSelected={selectedButton === "home"}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={homeIcon}
                        alt="Home"
                        className="w-5 h-5 flex-shrink-0"
                      />{" "}
                      {/* when not hovered (flex-shrink-0 makes the icon not shrink when not hovered) */}
                      <span className="hidden group-hover:inline">Home</span>{" "}
                      {/* when hovered */}
                    </div>
                  </Button>
                </li>

                <li>
                  <Button
                    onClick={() => handleButtonClick("/about", "about")}
                    isSelected={selectedButton === "about"}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={aboutIcon}
                        alt="About"
                        className="w-5 h-5 flex-shrink-0"
                      />{" "}
                      {/* when not hovered */}
                      <span className="hidden group-hover:inline">
                        About
                      </span>{" "}
                      {/* when hovered */}
                    </div>
                  </Button>
                </li>

                <li>
                  <Button
                    onClick={() => handleButtonClick("/dashboard", "dashboard")}
                    isSelected={selectedButton === "dashboard"}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={dashboardIcon}
                        alt="Dashboard"
                        className="w-5 h-5 flex-shrink-0"
                      />{" "}
                      {/* when not hovered */}
                      <span className="hidden group-hover:inline">
                        Dashboard
                      </span>{" "}
                      {/* when hovered */}
                    </div>
                  </Button>
                </li>
              </ul>
            </section>

            {/* Settings and Account Buttons */}
            <section aria-label="Settings and account">
              <ul
                className="flex flex-col items-start gap-2"
                style={{ fontFamily: "var(--font-subheading)" }}
              >
                <li>
                  <Button
                    onClick={() =>
                      handleButtonClick("/settings/account", "account")
                    }
                    isSelected={selectedButton === "account"}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={accountIcon}
                        alt="Account"
                        className="w-5 h-5 flex-shrink-0"
                      />{" "}
                      {/* when not hovered  */}
                      <span className="hidden group-hover:inline">
                        Account
                      </span>{" "}
                      {/* when hovered */}
                    </div>
                  </Button>
                </li>

                <li>
                  <Button
                    onClick={() =>
                      handleButtonClick(
                        "/settings/accessibility",
                        "accessibility"
                      )
                    }
                    isSelected={selectedButton === "accessibility"}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={accessibilityIcon}
                        alt="Accessibility"
                        className="w-5 h-5 flex-shrink-0"
                      />{" "}
                      {/* when not hovered */}
                      <span className="hidden group-hover:inline">
                        Accessibility
                      </span>{" "}
                      {/* when hovered */}
                    </div>
                  </Button>
                </li>

                <li>
                  <Button
                    onClick={() =>
                      handleButtonClick(
                        "/settings/notification",
                        "notification"
                      )
                    }
                    isSelected={selectedButton === "notification"}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={notificationIcon}
                        alt="Notification"
                        className="w-5 h-5 flex-shrink-0"
                      />{" "}
                      {/* when not hovered */}
                      <span className="hidden group-hover:inline">
                        Notification
                      </span>{" "}
                      {/* when hovered */}
                    </div>
                  </Button>
                </li>

                <li>
                  <Button
                    onClick={() => handleButtonClick("/", "quit")}
                    isSelected={selectedButton === "quit"}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={quitIcon}
                        alt="Quit"
                        className="w-5 h-5 flex-shrink-0"
                      />{" "}
                      {/* when not hovered */}
                      <span className="hidden group-hover:inline">
                        Quit
                      </span>{" "}
                      {/* when hovered */}
                    </div>
                  </Button>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
