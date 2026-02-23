class SessionDto {
  final String accessToken;
  final String? refreshToken;

  SessionDto({required this.accessToken, this.refreshToken});

  factory SessionDto.fromJson(Map<String, dynamic> json) {
    return SessionDto(
      accessToken: (json['access_token'] ?? json['token'] ?? '') as String,
      refreshToken: json['refresh_token'] as String?,
    );
  }
}