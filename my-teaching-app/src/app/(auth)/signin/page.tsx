import SignInForm from "@/modules/auth/components/signin-form/signin-form";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 1rem 3rem",
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      <SignInForm />
    </div>
  );
}
