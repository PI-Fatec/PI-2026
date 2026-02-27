import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../domain/entities/app_nav_item.dart';

class AppSidebar extends StatelessWidget {
  final List<AppNavItem> items;
  final String currentLocation;
  final VoidCallback? onItemSelected;
  final Widget? header;

  const AppSidebar({
    super.key,
    required this.items,
    required this.currentLocation,
    this.onItemSelected,
    this.header,
  });

  int _selectedIndex() {
    final idx = items.indexWhere((e) => currentLocation.startsWith(e.route));
    return idx >= 0 ? idx : 0;
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final selected = _selectedIndex();

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              if (header != null) header!,
              for (int i = 0; i < items.length; i++)
                ListTile(
                  leading: Icon(items[i].icon),
                  title: Text(items[i].label),
                  selected: i == selected,
                  selectedTileColor: cs.secondaryContainer,
                  iconColor: cs.onSurfaceVariant,
                  textColor: cs.onSurface,
                  selectedColor: cs.onSecondaryContainer,
                  onTap: () {
                    context.go(items[i].route);
                    onItemSelected?.call();
                  },
                ),
            ],
          ),
        ),
        const Divider(height: 1),
        Padding(
          padding: const EdgeInsets.only(bottom: 24.0),
          child: ListTile(
            leading: Icon(Icons.logout, color: cs.error),
            title: Text('Sair', style: TextStyle(color: cs.error)),
            onTap: () {
              onItemSelected?.call();
              showDialog(
                context: context,
                builder: (context) => CupertinoAlertDialog(
                  title: const Text('Confirmação'),
                  content: const Text('Deseja realmente sair?'),
                  actions: [
                    CupertinoDialogAction(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Cancelar'),
                    ),
                    CupertinoDialogAction(
                      isDestructiveAction: true,
                      onPressed: () {
                        Navigator.of(context).pop();
                        context.go('/welcome');
                      },
                      child: const Text('Sair'),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}