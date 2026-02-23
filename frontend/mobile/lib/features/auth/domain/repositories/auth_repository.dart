import '../entities/session.dart';

abstract class AuthRepository {
  Future<Session> login({required String email, required String password});
  Future<void> logout();

  Future<bool> hasSession();
}
