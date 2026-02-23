class Session {
  final String accessToken;
  final String? refreshToken;

  Session({required this.accessToken, this.refreshToken});
}