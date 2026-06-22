import AuthPage from "../components/AuthForm";

export default function Login({onLoginSuccess}) {
  return (
    <AuthPage mode="login" onLoginSuccess={onLoginSuccess}/>
  );
}
