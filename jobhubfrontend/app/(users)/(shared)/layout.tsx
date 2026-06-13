import NavigationBar from "./_components/navgation-bar";
import NavigationBarBottom from "./_components/navigation-bar-bottom";

const layout = ({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) => {
  return (
    <div>
      <nav>
        <NavigationBar />
        <NavigationBarBottom />
      </nav>
      <div className="px-16 py-2">
        {children}
        {modal}
      </div>
    </div>
  );
};

export default layout;
