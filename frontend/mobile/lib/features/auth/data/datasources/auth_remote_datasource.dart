import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../dto/login_request_dto.dart';
import '../dto/session_dto.dart';

class AuthRemoteDataSource {
  final ApiClient api;

  AuthRemoteDataSource(this.api);

  Future<SessionDto> login(LoginRequestDto body) async {
    final Response res = await api.dio.post('/auth/login', data: body.toJson());
    return SessionDto.fromJson(res.data as Map<String, dynamic>);
  }
}