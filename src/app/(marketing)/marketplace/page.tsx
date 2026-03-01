import { LogoIcons } from "@/components/shared/logos";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Page = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center p-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Marketplace
        </h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
};

export default Page;
