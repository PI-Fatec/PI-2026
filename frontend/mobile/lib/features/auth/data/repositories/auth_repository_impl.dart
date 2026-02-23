import '../../../../core/storage/token_tore.dart';
import '../../domain/entities/session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
import '../dto/login_request_dto.dart';
import '../mappers/session_mapper.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remote;
  final TokenStore tokenStore;

  AuthRepositoryImpl({required this.remote, required this.tokenStore});

  @override
  Future<Session> login({required String email, required String password}) async {
    final dto = await remote.login(LoginRequestDto(email: email, password: password));
    final session = SessionMapper.toEntity(dto);

    await tokenStore.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );

    return session;
  }

  @override
  Future<bool> hasSession() async {
    return await tokenStore.getAccessToken() != null;
  }

  @override
  Future<void> logout() async {
    await tokenStore.clear();
  }
}
