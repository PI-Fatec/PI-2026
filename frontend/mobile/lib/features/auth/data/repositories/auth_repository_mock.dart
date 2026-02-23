import '../../../../core/storage/token_tore.dart';
import '../../domain/entities/session.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryMock implements AuthRepository {
  final TokenStore tokenStore;

  AuthRepositoryMock(this.tokenStore);

  @override
  Future<Session> login({required String email, required String password}) async {
    // Simula delay de rede
    await Future.delayed(const Duration(milliseconds: 700));

    // Regra fake só para teste
    if (email.trim().isEmpty || password.isEmpty) {
      throw Exception('invalid_credentials');
    }

    // Token fake
    final session = Session(accessToken: 'mock_access_token_${DateTime.now().millisecondsSinceEpoch}');
    await tokenStore.saveTokens(accessToken: session.accessToken);
    return session;
  }

  @override
  Future<void> logout() async {
    await tokenStore.clear();
  }

  @override
  Future<bool> hasSession() async {
    final token = await tokenStore.getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
