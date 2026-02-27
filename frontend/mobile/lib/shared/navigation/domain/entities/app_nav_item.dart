import 'package:flutter/material.dart';

class AppNavItem {
  final String label;
  final IconData icon;
  final String route;

  const AppNavItem({
    required this.label,
    required this.icon,
    required this.route,
  });
}