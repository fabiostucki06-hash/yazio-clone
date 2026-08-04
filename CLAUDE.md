# YAZIO Clone - Projektexperte

## Befehle
- `npm test`: Führt die Jest-Tests aus.
- `npx expo start`: Startet den Expo-Dev-Server.
- `npx tsc --noEmit`: Überprüft das Projekt auf TypeScript-Fehler.

## Code-Style-Regeln
- Nutze funktionale React-Komponenten mit TypeScript.
- Styling ausschließlich über NativeWind/Tailwind.
- Keine Inline-Styles verwenden.
- Nutze `lucide-react-native` für Icons.

## Architektur
- `components/ui/`: Wiederverwendbare Basis-Komponenten (Buttons, Inputs).
- `services/`: API-Aufrufe und externe Anbindungen.
- `store/`: Zustand/State Management (z. B. Zustand).
