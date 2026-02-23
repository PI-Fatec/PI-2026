import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/login.dart';
import 'login_event.dart';
import 'login_state.dart';

class LoginBloc extends Bloc<LoginEvent, LoginState> {
  final Login loginUsecase;

  LoginBloc(this.loginUsecase) : super(const LoginState()) {
    on<LoginSubmitted>(_onSubmit);
  }

  Future<void> _onSubmit(LoginSubmitted event, Emitter<LoginState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, errorMessage: null));
    try {
      await loginUsecase(email: event.email, password: event.password);
      emit(state.copyWith(isLoading: false, success: true));
      // navegação fica na UI (listener) ou via um AuthCubit global
    } catch (_) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        errorMessage: 'Falha no login. Verifique suas credenciais.',
      ));
    }
  }
}
