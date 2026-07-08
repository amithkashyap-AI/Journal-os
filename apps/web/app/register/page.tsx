import Link from "next/link";
import { RegisterForm } from "../../components/forms/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create account</CardTitle>
          <CardDescription>Register as an author to submit manuscripts</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
