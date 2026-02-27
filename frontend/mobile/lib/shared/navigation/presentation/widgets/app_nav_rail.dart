// lib/shared/navigation/presentation/widgets/app_nav_rail.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/app_nav_item.dart';

class AppNavRail extends StatelessWidget {
  final List<AppNavItem> items;
  final String currentLocation;

  const AppNavRail({
    super.key,
    required this.items,
    required this.currentLocation,
  });

  int _selectedIndex() {
    final idx = items.indexWhere((e) => currentLocation.startsWith(e.route));
    return idx >= 0 ? idx : 0;
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final selected = _selectedIndex();

    return NavigationRail(
      backgroundColor: cs.surface,
      selectedIndex: selected,
      labelType: NavigationRailLabelType.all,
      destinations: [
        for (final item in items)
          NavigationRailDestination(
            icon: Icon(item.icon),
            label: Text(item.label),
          ),
      ],
      onDestinationSelected: (i) => GoRouter.of(context).go(items[i].route),
    );
  }
}