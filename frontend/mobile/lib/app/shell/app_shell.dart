// lib/app/shell/app_shell.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/navigation/domain/entities/app_nav_item.dart';
import '../../shared/navigation/presentation/widgets/app_sidebar.dart';

class AppShell extends StatelessWidget {
  final Widget child;
  final List<AppNavItem> items;
  final String location;

  const AppShell({
    super.key,
    required this.child,
    required this.items,
    required this.location,
  });

  Widget _header(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return DrawerHeader(
      decoration: BoxDecoration(color: cs.surfaceContainerHighest),
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Image(
            image: AssetImage('assets/images/logo.png'),
            width: 120,
            height: 100,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 8),
          Text('Menu', style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }

  String _getTitle() {
    final item = items.firstWhere(
      (item) => item.route == location,
      orElse: () => items.first,
    );
    return item.label;
  }

  bool _shouldShowBackButton() {
    return location != '/dashboard';
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        leading: _shouldShowBackButton()
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.go('/dashboard'),
              )
            : null,
        title: Text(_getTitle()),
        centerTitle: false,
      ),
      endDrawer: Drawer(
        child: Container(
          color: cs.surface,
          child: AppSidebar(
            items: items,
            currentLocation: location,
            header: _header(context),
            onItemSelected: () => Navigator.of(context).pop(),
          ),
        ),
      ),
      body: child,
    );
  }
}