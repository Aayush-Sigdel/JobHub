import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-muted/20">
      <div className="w-full max-w-md p-8 border rounded-lg bg-background shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground mb-6">
          Enter your details to sign in to your JobHub account......
        </p>

        <div className="flex flex-col gap-4">
          <Input placeholder="Email" />
          <Input placeholder="Password" />
          <Button className="w-full">Sign In</Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
