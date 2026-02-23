import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../core/notifications/local_notifications.dart';
import '../widgets/continue_button.dart';
import '../widgets/onboarding_dots.dart';
import '../widgets/onboarding_slide.dart';
import '../widgets/onboarding_notifications_slide.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _index = 0;
  bool _notificationPermissionRequested = false;
  bool _notificationPermissionInFlight = false;

  late final List<Widget> _pages = [
    const OnboardingSlide(
      title: 'Acompanhe seus dados',
      description:
          'Registre glicemia, pressão e alimentação em poucos segundos. Tudo organizado em um só lugar.',
      imageAsset: 'assets/images/splash/onboarding_1.png',
    ),
    const OnboardingSlide(
      title: 'Compartilhe com a clínica',
      description:
          'Seu médico acompanha tendências e alertas com gráficos e histórico centralizado.',
      imageAsset: 'assets/images/splash/onboarding_2.png',
    ),
    OnboardingNotificationsSlide(
      imageAsset: 'assets/images/splash/onboarding_3.png',
      onPermissionResult: (granted) {
        _notificationPermissionRequested = true;
      },
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _next() async {
    if (_index < _pages.length - 1) {
      await _controller.nextPage(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
      );
    } else {
      await _requestNotificationsIfNeeded();
      if (!mounted) return;
      context.go(Routes.auth);
    }
  }

  Future<void> _requestNotificationsIfNeeded() async {
    if (_notificationPermissionRequested || _notificationPermissionInFlight) {
      return;
    }

    _notificationPermissionInFlight = true;
    try {
      await LocalNotifications.requestPermission();
      _notificationPermissionRequested = true;
    } finally {
      _notificationPermissionInFlight = false;
    }
  }

  void _skip() => context.go(Routes.auth);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      // ✅ segue tema do sistema
      backgroundColor: cs.surface,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  Text(
                    'HealthTrack AI',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: _skip,
                    child: Text(
                      'Pular',
                      style: theme.textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: cs.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) {
                  setState(() => _index = i);
                  if (i == _pages.length - 1) {
                    _requestNotificationsIfNeeded();
                  }
                },
                itemBuilder: (context, i) => _pages[i],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 18),
              child: Column(
                children: [
                  OnboardingDots(count: _pages.length, index: _index),
                  const SizedBox(height: 14),
                  ContinueButton(
                    label: _index == _pages.length - 1 ? 'Começar' : 'Continuar',
                    onPressed: _next,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
