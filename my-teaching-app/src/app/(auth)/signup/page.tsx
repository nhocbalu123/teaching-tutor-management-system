import SignUpForm from "@/modules/auth/components/signup-form/signup-form";

export default function SignUpPage() {
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
      <SignUpForm />
    </div>
  );
}
