import 'secure_storage.dart';

class TokenStore {
  static const _kAccessToken = 'access_token';
  static const _kRefreshToken = 'refresh_token';

  Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await SecureStorage.write(_kAccessToken, accessToken);
    if (refreshToken != null) {
      await SecureStorage.write(_kRefreshToken, refreshToken);
    }
  }

  Future<String?> getAccessToken() => SecureStorage.read(_kAccessToken);
  Future<String?> getRefreshToken() => SecureStorage.read(_kRefreshToken);

  Future<void> clear() async {
    await SecureStorage.delete(_kAccessToken);
    await SecureStorage.delete(_kRefreshToken);
  }
}