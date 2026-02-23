import 'package:flutter/material.dart';
import 'app/bootstrap.dart';
import 'app/router/app_router.dart';
import 'app/theme/app_theme.dart';

void main() {
  bootstrap(() => const App());
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
      title: 'HealthTrack AI',
      themeMode: ThemeMode.system,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
    );
  }
}