import Link from "next/link";

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors "
    >
      {children}
    </Link>
  );
};
export default NavLink;
