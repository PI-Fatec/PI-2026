import 'package:flutter/material.dart';

class OnboardingDots extends StatelessWidget {
  final int count;
  final int index;

  const OnboardingDots({super.key, required this.count, required this.index});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (i) {
        final selected = i == index;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          height: 8,
          width: selected ? 22 : 8,
          decoration: BoxDecoration(
            color: selected ? cs.primary : cs.onSurfaceVariant.withValues(alpha: 0.40),
            borderRadius: BorderRadius.circular(20),
          ),
        );
      }),
    );
  }
}