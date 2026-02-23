import 'package:flutter/material.dart';

import '../../../../core/notifications/local_notifications.dart';

class OnboardingNotificationsSlide extends StatefulWidget {
  final String imageAsset;
  final ValueChanged<bool> onPermissionResult;

  const OnboardingNotificationsSlide({
    super.key,
    required this.imageAsset,
    required this.onPermissionResult,
  });

  @override
  State<OnboardingNotificationsSlide> createState() =>
      _OnboardingNotificationsSlideState();
}

class _OnboardingNotificationsSlideState
    extends State<OnboardingNotificationsSlide> {
  bool _requested = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 10, 18, 6),
      child: Column(
        children: [
          const Spacer(),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),

            child: Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(18),
                  child: AspectRatio(
                    aspectRatio: 10 / 10,
                    child: Image.asset(
                      widget.imageAsset,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Ative notificações',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Receba lembretes de medições e avisos importantes. Você pode alterar isso depois nas configurações.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: cs.onSurface.withValues(alpha: 0.75),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 14),

                // botão de permissões (separado do “Continuar”)
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                    onPressed: _requested
                        ? null
                        : () async {
                            final messenger = ScaffoldMessenger.of(context);
                            setState(() => _requested = true);
                            final granted =
                                await LocalNotifications.requestPermission();
                            if (!mounted) return;
                            widget.onPermissionResult(granted);
                            setState(() => _requested = false);

                            messenger.showSnackBar(
                              SnackBar(
                                showCloseIcon: true,
                                content: Text(
                                  granted
                                      ? 'Notificações ativadas.'
                                      : 'Permissão negada.',
                                ),
                              ),
                            );
                          },
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text('Ativar notificações'),
                  ),
                ),

                const SizedBox(height: 10),
                Text(
                  'Opcional',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: cs.onSurface.withValues(alpha: 0.55),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}
