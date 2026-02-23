import '../repositories/auth_repository.dart';

class HasSession {
  final AuthRepository repo;

  HasSession(this.repo);

  Future<bool> call() => repo.hasSession();
}