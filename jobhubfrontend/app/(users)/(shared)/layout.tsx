import NavigationBar from "@/components/navigation/navigation-bar";
import NavigationBarBottom from "@/components/navigation/navigation-bar-bottom";

const layout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div>
      <NavigationBar />
      <NavigationBarBottom />
      <div className="px-16 py-2">
        {children}
      </div>
    </div>
  );
};

export default layout;
