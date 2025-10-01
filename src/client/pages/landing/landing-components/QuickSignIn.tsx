import Button from "@/client/global-components/button";
import googleIcon from "@/client/assets/icons/google-logo.svg";
import outlookIcon from "@/client/assets/icons/outlook-icon.svg";

export function QuickSignIn() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Button onClick={() => {}}>
        <div className="flex items-center justify-center gap-4">
          <img src={googleIcon} alt="Google" className="w-8 h-8 flex-shrink-0" />
          <h3>Continue with Google</h3>
        </div>
      </Button>
      <Button onClick={() => {}}>
        <div className="flex items-center justify-center gap-4">
          <img src={outlookIcon} alt="Outlook" className="w-8 h-8 flex-shrink-0" />
          <h3>Continue with Outlook</h3>
        </div>
      </Button>
    </div>
  );
}
