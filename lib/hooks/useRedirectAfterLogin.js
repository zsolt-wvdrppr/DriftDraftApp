import { useRouter } from 'next/navigation';

export const useRedirectAfterLogin = () => {
  const router = useRouter();

  const redirectAfterLogin = () => {
    if (typeof window !== 'undefined') {
      const pathAndQuery = `${window.location.pathname}${window.location.search}`; // Combine pathname and search
      const loginUrl = `/login?redirect=${encodeURIComponent(pathAndQuery)}`;

      router.push(loginUrl); // Navigate to login page with redirect parameter
    }
  };

  return redirectAfterLogin;
};
