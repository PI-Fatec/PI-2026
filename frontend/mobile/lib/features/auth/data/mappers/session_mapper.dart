import '../../domain/entities/session.dart';
import '../dto/session_dto.dart';

class SessionMapper {
  static Session toEntity(SessionDto dto) =>
      Session(accessToken: dto.accessToken, refreshToken: dto.refreshToken);
}