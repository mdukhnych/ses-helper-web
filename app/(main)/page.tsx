import Spinner from "@/components/ui/spinner";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default function Home() {
  return (
    <div className="font-sans0">
      { <ThemeSwitcher /> }
      <Spinner />
      Main Page
    </div>
  );
}
