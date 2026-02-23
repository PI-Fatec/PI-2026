import '../entities/session.dart';
import '../repositories/auth_repository.dart';

class Login {
  final AuthRepository repo;

  Login(this.repo);

  Future<Session> call({
    required String email,
    required String password,
  }) {
    return repo.login(email: email, password: password);
  }
}