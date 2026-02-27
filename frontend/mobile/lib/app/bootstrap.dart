import 'dart:async' show FutureOr;

import 'package:flutter/widgets.dart';
import '../core/notifications/local_notifications.dart';

Future<void> bootstrap(FutureOr<Widget> Function() builder) async {
  WidgetsFlutterBinding.ensureInitialized();


  await LocalNotifications.init();

  final app = await builder();
  runApp(app);
}
