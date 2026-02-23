import '../repositories/auth_repository.dart';

class Logout {
  final AuthRepository repo;

  Logout(this.repo);

  Future<void> call() => repo.logout();
}