import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../core/storage/token_tore.dart';
import '../../features/auth/data/repositories/auth_repository_mock.dart';
import '../../features/auth/domain/usecases/login.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/auth/presentation/bloc/login_bloc.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import 'routes.dart';

// mock wiring
final _tokenStore = TokenStore();
final _authRepo = AuthRepositoryMock(_tokenStore);
final _loginUsecase = Login(_authRepo);

final GoRouter appRouter = GoRouter(
  initialLocation: Routes.welcome,
  routes: [
    GoRoute(
      path: Routes.welcome,
      builder: (context, state) => const OnboardingPage(),
    ),
    GoRoute(
      path: Routes.auth,
      builder: (context, state) {
        return BlocProvider(
          create: (_) => LoginBloc(_loginUsecase),
          child: const LoginPage(),
        );
      },
    ),
    GoRoute(
      path: Routes.dashboard,
      builder: (_, state) =>
          const Scaffold(body: Center(child: Text('Dashboard'))),
    ),
  ],
);
