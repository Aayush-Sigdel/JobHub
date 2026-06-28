import NavigationBar from "../(applier)/_components/navigation/navigation-bar";
import NavigationBarBottom from "../(applier)/_components/navigation/navigation-bar-bottom";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavigationBar />
      <NavigationBarBottom />
      <div className="flex-1">{children}</div>
    </div>
  );
}
