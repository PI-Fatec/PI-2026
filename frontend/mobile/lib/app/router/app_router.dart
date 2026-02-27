import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../shared/navigation/domain/entities/app_nav_item.dart';
import '../shell/app_shell.dart';

import '../../core/storage/token_tore.dart';
import '../../features/auth/data/repositories/auth_repository_mock.dart';
import '../../features/auth/domain/usecases/login.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/auth/presentation/bloc/login_bloc.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/clientes/presentation/pages/clientes_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import 'routes.dart';


final navItems = <AppNavItem>[
  const AppNavItem(label: 'Dashboard', icon: Icons.dashboard, route: '/dashboard'),
  const AppNavItem(label: 'Clientes', icon: Icons.people, route: '/clientes'),
  const AppNavItem(label: 'Config', icon: Icons.settings, route: '/settings'),
];


// mock wiring
final _tokenStore = TokenStore();
final _authRepo = AuthRepositoryMock(_tokenStore);
final _loginUsecase = Login(_authRepo);

final GoRouter appRouter = GoRouter(
  initialLocation: Routes.welcome,
  routes: [
    // Rotas sem sidebar (welcome, login)
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
    // Rotas com sidebar (dashboard, clientes, settings)
    ShellRoute(
      builder: (context, state, child) {
        return AppShell(
          items: navItems,
          location: state.uri.toString(),
          child: child,
        );
      },
      routes: [
        GoRoute(
          path: Routes.dashboard,
          builder: (context, state) => const DashboardPage(),
        ),
        GoRoute(
          path: Routes.clientes,
          builder: (context, state) => const ClientesPage(),
        ),
        GoRoute(
          path: Routes.settings,
          builder: (context, state) => const SettingsPage(),
        ),
      ],
    ),
  ],
);
