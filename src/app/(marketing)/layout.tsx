import Navbar from "@/components/navbar";
import "../globals.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <div>{children}</div>
    </div>
  );
};
export default Layout;
