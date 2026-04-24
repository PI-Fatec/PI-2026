import { Redirect, useLocalSearchParams } from 'expo-router';

export default function InviteDeepLinkEntry() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  if (!token) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href={{ pathname: '/auth/invite' as any, params: { token } }} />;
}
