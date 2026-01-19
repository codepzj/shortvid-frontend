import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/third_party/firebase";

export default function Login() {
  const googleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, provider);

      console.log("displayName:", res.user.displayName);
      console.log("email:", res.user.email);
      console.log("photoURL:", res.user.photoURL);
      console.log("provider:", res.user.providerId);
      console.log("providerUID:", res.user.uid);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <button onClick={googleLogin}>
      使用 Google 登录
    </button>
  );
}
