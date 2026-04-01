import 'package:campkit/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('CampKit renders navigation labels', (tester) async {
    await tester.pumpWidget(const CampKitApp());

    expect(find.text('Gear'), findsOneWidget);
    expect(find.text('Trips'), findsOneWidget);
  });
}
