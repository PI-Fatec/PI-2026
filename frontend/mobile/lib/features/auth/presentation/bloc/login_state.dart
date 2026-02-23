class LoginState {
  final bool isLoading;
  final bool success;
  final String? errorMessage;

  const LoginState({
    this.isLoading = false,
    this.success = false,
    this.errorMessage,
  });

  LoginState copyWith({
    bool? isLoading,
    bool? success,
    String? errorMessage,
  }) {
    return LoginState(
      isLoading: isLoading ?? this.isLoading,
      success: success ?? this.success,
      errorMessage: errorMessage,
    );
  }
}
